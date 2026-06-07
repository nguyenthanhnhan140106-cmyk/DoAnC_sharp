// src/Frontend/src/components/TuneBot/ChatWindow.tsx
import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import styles from "./styles/tuneBot.module.css";
import type { Message } from "./useTuneBot";

interface Props {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onClose: () => void;
  onReset: () => void;
}

export default function ChatWindow({ messages, loading, error, onSend, onClose, onReset }: Props) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // scroll to bottom after new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // focus on input when window opens
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const txt = input.trim();
    if (!txt) return;
    onSend(txt);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.window}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar}>🎵</div>
        <div className={styles.info}>
          <span className={styles.name}>TuneBot</span>
          <span className={styles.status}>● Trực tuyến</span>
        </div>
        <button
          className={styles.resetBtn}
          onClick={onReset}
          title="Tạo cuộc trò chuyện mới"
        >
          {/* Pencil / New chat icon */}
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
          </svg>
        </button>
        <button className={styles.closeBtn} onClick={onClose} title="Đóng">✕</button>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎵</div>
            <p className={styles.emptyTitle}>Xin chào! Tôi là TuneBot</p>
            <p className={styles.emptySubtitle}>Hỏi tôi về nhạc, nghệ sĩ hoặc bài hát yêu thích của bạn.</p>
            <div className={styles.suggestions}>
              {["Gợi ý bài hát", "Tìm nghệ sĩ", "Bạn là ai?"].map(q => (
                <button key={q} className={styles.suggestionBtn} onClick={() => { onSend(q); }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))
        )}
        {loading && (
          <MessageBubble
            message={{ role: "bot", text: "", time: "" }}
            isTyping
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && <div className={styles.error}>⚠️ {error}</div>}

      {/* Input row */}
      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          placeholder="Nhập câu hỏi..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
