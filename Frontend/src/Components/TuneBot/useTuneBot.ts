import { useState, useEffect } from "react";
import API from "../../Services/api";

export interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

function getClientFallback(question: string): string {
  const q = question.toLowerCase();
  const fallbacks = [
    ["chào|hello|hi|hey", "👋 Xin chào! Tôi là TuneBot 🎵\nTôi có thể giúp bạn tìm nhạc, hướng dẫn tính năng. Bạn cần gì?"],
    ["tìm|search|kiếm", "🔍 Dùng thanh search ở đầu trang để tìm bài hát hoặc nghệ sĩ nhé!"],
    ["phát|play|nghe", "▶️ Click vào bài hát bất kỳ để phát nhạc. PlayerBar ở dưới sẽ xuất hiện!"],
    ["thể loại|vsound|friday|rap", "📂 TuneVault có 3 thể loại:\n- 🇻🇳 V-Sound: Nhạc Việt\n- 🎉 Friday: Nhạc mới\n- 🎤 Rap: Hip-hop"],
    ["album|nghệ sĩ|artist", "💿 Xem album và nghệ sĩ trên trang chủ hoặc tìm kiếm theo tên nhé!"],
    ["cảm ơn|thanks|ok|oke", "😊 Không có gì! Chúc bạn nghe nhạc vui vẻ 🎶"],
    ["shuffle|trộn|lặp|repeat", "🔀 Dùng nút shuffle và repeat ở PlayerBar để bật ngẫu nhiên và lặp lại bài!"],
    ["âm lượng|volume", "🔊 Kéo thanh âm lượng ở góc phải PlayerBar để điều chỉnh!"],
    ["bạn là ai|tunebot là", "🤖 Tôi là TuneBot – trợ lý AI của TuneVault!\nHỏi tôi bất cứ điều gì về nhạc và ứng dụng nhé 🎶"],
  ];

  for (const [pattern, reply] of fallbacks) {
    if (new RegExp(pattern).test(q)) return reply;
  }

  const genericReplies = [
    "🤔 Tôi chưa hiểu rõ. Hỏi tôi về tìm nhạc, thể loại, hoặc cách dùng app nhé!",
    "😅 Hmm, hãy thử hỏi: \"Làm sao tìm bài hát?\" hoặc \"Có những thể loại nào?\"",
    "🎵 Tôi là TuneBot! Tôi giỏi tư vấn nhạc và hướng dẫn dùng TuneVault 😊",
  ];
  return genericReplies[Math.floor(Math.random() * genericReplies.length)];
}

export default function useTuneBot() {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tunebotMessages");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tunebotMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const send = async (text: string) => {
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { role: "user", text, time: now };

    setMessages((prev) => [...prev, userMsg, { role: "bot", text: "", time: now }]);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (!res.ok) throw new Error("API lỗi");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("No reader available");

      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              const dataStr = trimmedLine.substring(6);
              if (dataStr === "[DONE]") {
                done = true;
                break;
              }
              const textChunk = dataStr.replace(/\\n/g, "\n");
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                lastMsg.text += textChunk;
                return newMessages;
              });
            }
          }
        }
      }
    } catch (e: unknown) {
      console.error("Backend lỗi, chuyển sang fallback:", e);
      const mockReply = getClientFallback(text);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.text = mockReply;
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, send, setMessages };
}
