import { useState, useEffect } from "react";
import API from "../../Services/api";

export interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

// 1. Hàm fallback (để riêng biệt, nằm ngoài hàm chính)
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

// 2. Hook chính
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

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const res = await API.post("/ai/chat", {
        message: text,
        history: messages.map((m) => ({ role: m.role, text: m.text })),
      });

      // Lấy câu trả lời từ API
      const reply = res.data.reply || "Xin lỗi, tôi chưa hiểu câu hỏi.";
      const botMsg: Message = { role: "bot", text: reply, time: now };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e: unknown) {
      console.error("Backend lỗi, chuyển sang fallback:", e);
      // Fallback khi gọi API thất bại
      const mockReply = getClientFallback(text);
      const botMsg: Message = { role: "bot", text: mockReply, time: now };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, send, setMessages };
}
