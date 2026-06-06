using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Dapper;
using MySqlConnector;

namespace Application.Services
{
    /// <summary>
    /// DTO nhận từ Frontend gửi lên: lịch sử hội thoại + câu hỏi mới
    /// </summary>
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public List<ChatHistoryItem> History { get; set; } = new();
    }

    public class ChatHistoryItem
    {
        public string Role { get; set; } = string.Empty; // "user" | "bot"
        public string Text { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO trả về Frontend
    /// </summary>
    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public bool Success { get; set; } = true;
        public string? Error { get; set; }
    }

    /// <summary>
    /// Service gọi Gemini API server-side để trả lời câu hỏi của người dùng
    /// </summary>
    public class AiService
    {
        private readonly HttpClient _http;
        private readonly string _geminiKey;
        private readonly string _connectionString;
        private const string GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        // System prompt định nghĩa nhân cách TuneBot
        private const string SYSTEM_PROMPT = @"Bạn là TuneBot - trợ lý AI thông minh của TuneVault, một ứng dụng nghe nhạc trực tuyến.

Nhiệm vụ:
- Hỗ trợ người dùng sử dụng ứng dụng TuneVault
- Gợi ý bài hát, nghệ sĩ, thể loại phù hợp tâm trạng
- Giải thích các tính năng của ứng dụng: tìm kiếm, phát nhạc, xem album, thể loại (V-Sound, Friday, Rap)
- Trả lời ngắn gọn, thân thiện, dùng emoji phù hợp

Quy tắc:
- Luôn trả lời bằng tiếng Việt trừ khi người dùng hỏi bằng tiếng Anh
- Không trả lời các chủ đề ngoài âm nhạc và ứng dụng
- Câu trả lời tối đa 150 từ, ngắn gọn súc tích
- Dùng markdown (**, -, emoji) để format đẹp";

        public AiService(HttpClient http, string geminiKey, string connectionString = "")
        {
            _http = http;
            _geminiKey = geminiKey;
            _connectionString = connectionString;
        }

        public async Task<ChatResponse> ChatAsync(ChatRequest request)
        {
            // Xây dựng full prompt bao gồm lịch sử
            var historyText = string.Join("\n", request.History.ConvertAll(h =>
                $"{(h.Role == "user" ? "Người dùng" : "TuneBot")}: {h.Text}"));

            var fullPrompt = $"{SYSTEM_PROMPT}\n\nLịch sử:\n{historyText}\n\nNgười dùng: {request.Message}\nTuneBot:";

            var body = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = fullPrompt } } }
                },
                generationConfig = new
                {
                    temperature = 0.7,
                    maxOutputTokens = 300
                }
            };

            try
            {
                var url = $"{GEMINI_URL}?key={_geminiKey}";
                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var res = await _http.PostAsync(url, content);

                if (!res.IsSuccessStatusCode)
                {
                    var errBody = await res.Content.ReadAsStringAsync();
                    return new ChatResponse
                    {
                        Success = false,
                        Error = $"Gemini API lỗi {(int)res.StatusCode}",
                        Reply = GetFallbackReply(request.Message)
                    };
                }

                var data = await res.Content.ReadFromJsonAsync<JsonElement>();
                var reply = data
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString() ?? GetFallbackReply(request.Message);

                return new ChatResponse { Reply = reply.Trim(), Success = true };
            }
            catch (Exception ex)
            {
                return new ChatResponse
                {
                    Success = false,
                    Error = ex.Message,
                    Reply = GetFallbackReply(request.Message)
                };
            }
        }

        // Fallback khi API lỗi — trả về câu trả lời mock
        private static string GetFallbackReply(string message)
        {
            var q = message.ToLower();

            if (q.Contains("chào") || q.Contains("hello") || q.Contains("hi"))
                return "👋 Xin chào! Tôi là TuneBot 🎵\nTôi có thể giúp bạn tìm nhạc, hướng dẫn tính năng. Bạn cần gì?";

            if (q.Contains("tìm") || q.Contains("search") || q.Contains("kiếm"))
                return "🔍 Dùng thanh search ở đầu trang để tìm bài hát hoặc nghệ sĩ nhé!";

            if (q.Contains("phát") || q.Contains("play") || q.Contains("nghe"))
                return "▶️ Click vào bài hát bất kỳ để phát nhạc. PlayerBar ở dưới sẽ xuất hiện!";

            if (q.Contains("thể loại") || q.Contains("category") || q.Contains("vsound") || q.Contains("friday") || q.Contains("rap"))
                return "📂 TuneVault có 3 thể loại:\n- 🇻🇳 V-Sound: Nhạc Việt\n- 🎉 Friday: Nhạc mới\n- 🎤 Rap: Hip-hop";

            if (q.Contains("cảm ơn") || q.Contains("thanks"))
                return "😊 Không có gì! Chúc bạn nghe nhạc vui vẻ 🎶";

            return "🤔 Tôi chưa hiểu câu hỏi đó. Hãy hỏi về:\n- 🔍 Tìm bài hát\n- ▶️ Cách phát nhạc\n- 📂 Thể loại nhạc";
        }

        public async Task<List<string>> AutoTagSongAsync(int songId)
        {
            if (string.IsNullOrEmpty(_connectionString))
                throw new Exception("Connection string is not configured.");

            using var conn = new MySqlConnection(_connectionString);
            var song = await conn.QueryFirstOrDefaultAsync<dynamic>("SELECT Title, Artist FROM songs WHERE Id = @Id", new { Id = songId });
            
            if (song == null)
                throw new Exception($"Không tìm thấy bài hát có Id = {songId}");

            string title = song.Title;
            string artist = song.Artist;

            var prompt = $"Đóng vai một chuyên gia âm nhạc. Phân tích bài hát '{title}' của '{artist}' và trả về 3-5 thẻ (tags) thể loại nhạc phù hợp nhất (ví dụ: Pop, Lo-fi, Rap, Acoustic). Chỉ trả về danh sách các tag, phân tách bằng dấu phẩy, không có bất kỳ văn bản nào khác.";

            var body = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { temperature = 0.5, maxOutputTokens = 50 }
            };

            var url = $"{GEMINI_URL}?key={_geminiKey}";
            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var res = await _http.PostAsync(url, content);
            if (!res.IsSuccessStatusCode)
            {
                var err = await res.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi gọi Gemini API: {err}");
            }

            var data = await res.Content.ReadFromJsonAsync<JsonElement>();
            var reply = data
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";

            var tags = new List<string>();
            foreach (var t in reply.Split(','))
            {
                var tag = t.Trim();
                if (!string.IsNullOrEmpty(tag))
                {
                    tags.Add(tag);
                    // Lưu tag vào DB, bỏ qua nếu đã có (tránh duplicate thì dùng INSERT IGNORE, tuy nhiên table không unique constraint nên ta cứ insert)
                    await conn.ExecuteAsync("INSERT INTO media_tags (SongId, Tag) VALUES (@SongId, @Tag)", new { SongId = songId, Tag = tag });
                }
            }
            return tags;
        }
    }
}
