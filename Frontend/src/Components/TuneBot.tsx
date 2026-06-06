import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔑 Dán API Key Gemini của bạn vào đây
const GEMINI_KEY = '[GCP_API_KEY]'; // <-- thay bằng key thật của bạn

const SYSTEM_PROMPT = `Bạn là TuneBot - trợ lý AI của TuneVault, một ứng dụng nghe nhạc.
Nhiệm vụ của bạn là giúp người dùng:
- Tìm kiếm bài hát, album, nghệ sĩ bằng cách hướng dẫn họ dùng thanh tìm kiếm ở đầu trang
- Giải thích các tính năng: Playlist, Lịch sử phát, Yêu thích, Trang chủ
- Gợi ý bài hát theo mood (buồn, vui, tập gym, học bài...)
- Hướng dẫn điều hướng trong app (click vào đâu, làm gì)
- Trả lời ngắn gọn, thân thiện, dùng emoji phù hợp
- Luôn trả lời bằng tiếng Việt

Các tính năng của TuneVault:
- Trang chủ: xem bài hát nổi bật, album mới
- Thanh search: tìm bài hát, nhấn Enter để tìm
- Album: click vào album để xem danh sách bài
- PlayerBar: thanh phát nhạc ở dưới cùng (play/pause/next)
- Thư viện bên trái: playlist cá nhân
- Nút "+" ở PlayerBar: thêm vào playlist
`;

interface Message {
    role: 'user' | 'bot';
    text: string;
    time: string;
}

const QUICK_QUESTIONS = [
    '🎵 Làm sao tìm bài hát?',
    '📋 Tạo playlist ở đâu?',
    '▶️ Cách phát nhạc?',
    '🔥 Gợi ý nhạc vui?',
];

// ── Smart Mock: Tự trả lời khi Gemini API lỗi ──
const MOCK_ANSWERS: { keywords: string[]; answers: string[] }[] = [
    {
        keywords: ['gợi ý', 'vui', 'phấn khích', 'năng động', 'gym', 'tập', 'upbeat', 'edm'],
        answers: [
            '🔥 Nhạc vui/năng động tôi gợi ý:\n- Vào mục **Friday** để nghe nhạc mới nhất 🎉\n- Thử mục **Rap** để có beat sôi động 🎤\n- Tìm "upbeat", "EDM", "pop" trên thanh search nhé!',
            '💃 Muốn nhạc bốc lửa? Thử ngay:\n- **Rap** trong sidebar → nhiều bài hype lắm\n- Hoặc search "dance", "party" trên thanh tìm kiếm!\nChúc bạn có playlist sôi động 🎶',
        ],
    },
    {
        keywords: ['buồn', 'chill', 'lo-fi', 'nhẹ nhàng', 'thư giãn', 'acoustic', 'ballad'],
        answers: [
            '🎧 Nhạc chill/buồn tôi gợi ý:\n- Thử mục **V-Sound** để nghe nhạc Việt nhẹ nhàng 🌙\n- Tìm "lo-fi", "acoustic", "ballad" trên thanh search\n- Bật nhạc rồi thư giãn thôi!',
            '🌙 Muốn chill thì thử:\n- **V-Sound** trong menu thể loại → nhạc Việt trữ tình\n- Search "nhạc buồn", "chill vibes" cho ra nhiều bài hay lắm 🎵',
        ],
    },
    {
        keywords: ['thể loại', 'category', 'vsound', 'friday', 'rap', 'danh mục'],
        answers: [
            '📂 TuneVault có 3 thể loại chính:\n- 🇻🇳 **V-Sound**: Nhạc Việt trữ tình\n- 🎉 **Friday**: Nhạc mới phát hành mỗi tuần\n- 🎤 **Rap**: Hip-hop & rap Việt\n\nClick vào tên thể loại trong sidebar bên trái để khám phá nhé!',
            '🎵 Các thể loại nhạc:\n- **V-Sound** → Nhạc Việt\n- **Friday** → New releases\n- **Rap** → Hip-hop\n\nBạn thích thể loại nào? Tôi có thể gợi ý thêm!',
        ],
    },
    {
        keywords: ['playlist', 'danh sách phát', 'tạo playlist', 'thêm vào'],
        answers: [
            '📋 Tính năng Playlist:\n- Hiện tại click vào **Album** để xem danh sách bài 💿\n- Tính năng tạo playlist cá nhân đang được phát triển 🚧\n- Ở PlayerBar có thể shuffle và lặp lại bài!',
        ],
    },
    {
        keywords: ['album', 'ca sĩ', 'nghệ sĩ', 'artist'],
        answers: [
            '💿 Xem Album:\n1. Trang chủ → xem **Album nổi bật**\n2. Click vào album để xem danh sách bài\n3. Hoặc search tên nghệ sĩ trên thanh tìm kiếm 🎤',
            '🎤 Tìm nghệ sĩ:\n- Gõ tên nghệ sĩ vào **ô tìm kiếm** ở đầu trang\n- Kết quả sẽ hiện bài hát của họ 🎵\n- Click vào **Album** trên trang chủ để xem theo album!',
        ],
    },
    {
        keywords: ['phát', 'play', 'nghe', 'chơi nhạc', 'cách phát'],
        answers: [
            '▶️ Cách phát nhạc:\n1. Click vào **ảnh bìa** hoặc nút ▶ trên bài hát\n2. Thanh **PlayerBar** ở dưới cùng sẽ hiện lên\n3. Dùng nút ⏮ ⏯ ⏭ để điều khiển!\n\nVui lòng thử ngay nhé 🎶',
            '🎵 Để nghe nhạc:\n- **Click** vào bất kỳ bài hát nào\n- PlayerBar dưới màn hình sẽ bắt đầu phát\n- Điều chỉnh âm lượng bằng thanh trượt bên phải PlayerBar!',
        ],
    },
    {
        keywords: ['tìm', 'search', 'kiếm', 'tìm kiếm'],
        answers: [
            '🔍 Tìm bài hát:\n1. Gõ tên bài/nghệ sĩ vào **thanh search** ở đầu trang\n2. Gợi ý hiện ra ngay khi gõ ✨\n3. Nhấn **Enter** để xem đầy đủ kết quả\n\nCó bộ lọc theo thể loại và sắp xếp trên trang kết quả!',
            '🔎 Thanh tìm kiếm ở **trên cùng trang** nhé!\n- Gõ tên bài → gợi ý tự động\n- Nhấn Enter → trang kết quả đầy đủ\n- Lọc theo V-Sound / Friday / Rap nếu muốn 🎯',
        ],
    },
    {
        keywords: ['trang chủ', 'home', 'quay lại', 'về nhà'],
        answers: [
            '🏠 Về trang chủ:\n- Click **logo TuneVault** ở góc trên trái\n- Hoặc click nút **🏠 ngôi nhà** cạnh thanh search!',
        ],
    },
    {
        keywords: ['lỗi', 'không chạy', 'sự cố', 'broken', 'hỏng'],
        answers: [
            '🔧 Xử lý sự cố:\n1. Thử **F5** tải lại trang\n2. Kiểm tra kết nối internet\n3. Đảm bảo **Backend Docker** đang chạy\n\nNếu vẫn lỗi, báo admin nhé!',
        ],
    },
    {
        keywords: ['xin chào', 'hello', 'hi', 'chào', 'hey'],
        answers: [
            '👋 Xin chào! Tôi là TuneBot 🎵\nTôi có thể giúp bạn:\n- 🔍 Tìm bài hát/nghệ sĩ\n- ▶️ Hướng dẫn phát nhạc\n- 📂 Khám phá thể loại\n- 💿 Xem album\n\nBạn cần hỗ trợ gì?',
            '🎵 Chào bạn! Mình là TuneBot, trợ lý của TuneVault!\nHỏi tôi bất cứ điều gì về ứng dụng nhé 😊',
        ],
    },
];

function getMockAnswer(question: string): string {
    const q = question.toLowerCase();
    for (const item of MOCK_ANSWERS) {
        if (item.keywords.some(kw => q.includes(kw))) {
            return item.answers[Math.floor(Math.random() * item.answers.length)];
        }
    }
    return '🤔 Câu hỏi hay! TuneVault có các tính năng:\n🔍 **Tìm kiếm** bài hát/nghệ sĩ\n▶️ **Phát nhạc** với PlayerBar\n💿 **Album** với danh sách bài\n📂 **Thể loại**: V-Sound, Friday, Rap\n\nBạn muốn biết thêm về tính năng nào?';
}

export default function TuneBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'bot',
            text: 'Xin chào! Tôi là TuneBot 🎵\nTôi có thể giúp bạn sử dụng TuneVault từ A đến Z. Bạn cần hỗ trợ gì không?',
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async (text?: string) => {
        const msg = (text ?? input).trim();
        if (!msg || loading) return;

        const now = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const newMessages: Message[] = [...messages, { role: 'user', text: msg, time: now }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Ghép lịch sử hội thoại vào prompt
            const history = newMessages
                .slice(1)
                .map(m => `${m.role === 'user' ? 'Người dùng' : 'TuneBot'}: ${m.text}`)
                .join('\n');

            const fullPrompt = `${SYSTEM_PROMPT}\n\nLịch sử hội thoại:\n${history}\n\nTuneBot:`;

            // Gọi thẳng Gemini REST API (hỗ trợ cả 2 định dạng key)
            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: fullPrompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
                    }),
                }
            );

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                const status = res.status;
                if (status === 429) throw new Error('RATE_LIMIT');
                if (status === 403 || status === 401) throw new Error('INVALID_KEY');
                throw new Error(errJson?.error?.message || `HTTP ${status}`);
            }

            const data = await res.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, tôi không hiểu câu hỏi này.';

            setMessages(prev => [
                ...prev,
                {
                    role: 'bot',
                    text: reply,
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        } catch {
            // Hiện dấu 3 chấm "đang gõ" rồi mới trả lời (tự nhiên hơn)
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
            const mockReply = getMockAnswer(msg);
            setMessages(prev => [
                ...prev,
                {
                    role: 'bot',
                    text: mockReply,
                    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={`tunebot-fab ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="TuneBot - Trợ lý AI"
            >
                {isOpen ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    // Icon nốt nhạc 🎵
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                )}
                {hasUnread && !isOpen && <span className="tunebot-badge" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="tunebot-window">
                    {/* Header */}
                    <div className="tunebot-header">
                        <div className="tunebot-avatar">🎵</div>
                        <div className="tunebot-header-info">
                            <span className="tunebot-name">TuneBot</span>
                            <span className="tunebot-status">● Trực tuyến</span>
                        </div>
                        <button className="tunebot-close" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    {/* Messages */}
                    <div className="tunebot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`tunebot-msg ${msg.role}`}>
                                {msg.role === 'bot' && <div className="tunebot-msg-avatar">🎵</div>}
                                <div className="tunebot-msg-bubble">
                                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    <span className="tunebot-msg-time">{msg.time}</span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="tunebot-msg bot">
                                <div className="tunebot-msg-avatar">🎵</div>
                                <div className="tunebot-msg-bubble tunebot-typing">
                                    <span /><span /><span />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick questions - chỉ hiện khi mới mở */}
                    {messages.length <= 2 && (
                        <div className="tunebot-quick">
                            {QUICK_QUESTIONS.map((q, i) => (
                                <button key={i} className="tunebot-quick-btn" onClick={() => sendMessage(q)}>
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="tunebot-input-row">
                        <input
                            ref={inputRef}
                            type="text"
                            className="tunebot-input"
                            placeholder="Nhập câu hỏi..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            disabled={loading}
                        />
                        <button
                            className="tunebot-send"
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
