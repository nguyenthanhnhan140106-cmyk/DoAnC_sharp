// src/Components/TuneBot/TuneBot.tsx
import { useState } from "react";
import useTuneBot from "./useTuneBot";
import ChatWindow from "./ChatWindow";
import styles from "./styles/tuneBot.module.css";

export default function TuneBot() {
  // State for opening/closing the chat window
  const [isOpen, setIsOpen] = useState(false);

  // Hook to interact with the TuneBot backend, includes setMessages for resetting chat history
  const { messages, loading, error, send, setMessages } = useTuneBot();


  // Compute button class name; trim to avoid extra whitespace
  const buttonClass = `${styles?.fab ?? ""} ${isOpen ? styles?.open ?? "" : ""}`.trim();

  // Toggle chat window visibility
  const toggle = () => setIsOpen(prev => !prev);

  // Show badge when there are unread bot messages while the window is closed
  const hasUnread = !isOpen && messages.some(m => m.role === "bot");

  return (
    <>
      {/* Floating Button — style prop removed so CSS module .fab takes full control */}
      <button
        className={buttonClass}
        onClick={toggle}
        title="TuneBot - Trợ lý AI"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        )}
        {hasUnread && <span className={styles.badge} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          messages={messages}
          loading={loading}
          error={error}
          onSend={send}
          onClose={toggle}
          onReset={() => setMessages([])}
        />
      )}
    </>
  );
}
