// src/Frontend/src/components/TuneBot/MessageBubble.tsx
import React from "react";
import styles from "./styles/tuneBot.module.css";
import type { Message } from "./useTuneBot";

interface Props {
  message: Message;
  isTyping?: boolean; // shows three‑dot animation when true
}

export default function MessageBubble({ message, isTyping = false }: Props) {
  const { role, text, time } = message;
  const isBot = role === "bot";

  return (
    <div className={`${styles.msg} ${isBot ? styles.bot : styles.user}`}>
      {isBot && <div className={styles.avatar}>🎵</div>}
      <div className={styles.bubble}>
        {isTyping ? (
          <div className={styles.typing}>
            <span />
            <span />
            <span />
          </div>
        ) : (
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{text}</p>
        )}
        {time && <span className={styles.time}>{time}</span>}
      </div>
    </div>
  );
}
