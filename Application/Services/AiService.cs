using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;
using Dapper;
using MySqlConnector;
using Microsoft.Extensions.Configuration; // Dòng này là bắt buộc

namespace Application.Services
{
    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public List<ChatHistoryItem> History { get; set; } = new();
    }

    public class ChatHistoryItem
    {
        public string Role { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
    }

    public class ChatResponse
    {
        public string Reply { get; set; } = string.Empty;
        public bool Success { get; set; } = true;
        public string? Error { get; set; }
    }

    public class AiService
    {
        private readonly HttpClient _http;
        private readonly string _connectionString;
        private readonly string _aiServerUrl;
        
        // URL Ngrok trỏ tới máy bàn (KoboldCPP)
        private const string AI_SERVER_URL = "https://stitch-pronounce-frisk.ngrok-free.dev/v1/chat/completions";

        private const string SYSTEM_PROMPT = @"Bạn là TuneBot - trợ lý AI thông minh của TuneVault. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.";

        public AiService(HttpClient http, IConfiguration config, string connectionString = "")
        {
            _http = http;
            _connectionString = connectionString;
        
        // Đọc từ mục "Gemini:ApiKey" (bạn có thể đổi tên key thành "AiServerUrl" sau này)
            _aiServerUrl = config["Gemini:ApiKey"] ?? "https://default-fallback.ngrok-free.dev/v1/chat/completions";
        }
        // --- Hàm Chat cho người dùng ---
        public async Task<ChatResponse> ChatAsync(ChatRequest request)
        {
            var messages = new List<object> { new { role = "system", content = SYSTEM_PROMPT } };
            foreach (var h in request.History)
            {
                messages.Add(new { role = h.Role == "user" ? "user" : "assistant", content = h.Text });
            }
            messages.Add(new { role = "user", content = request.Message });

            var body = new { messages, temperature = 0.7, max_tokens = 300 };

            try
            {
                var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
                var res = await _http.PostAsync(AI_SERVER_URL, content);

                if (!res.IsSuccessStatusCode) throw new Exception($"Lỗi máy bàn: {res.StatusCode}");

                var data = await res.Content.ReadFromJsonAsync<JsonElement>();
                var reply = data.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                return new ChatResponse { Reply = reply?.Trim() ?? "AI không phản hồi", Success = true };
            }
            catch (Exception ex)
            {
                return new ChatResponse { Success = false, Error = ex.Message, Reply = GetFallbackReply(request.Message) };
            }
        }

        // --- Hàm AutoTag (Đã chuyển sang dùng AI Local trên máy bàn) ---
        public async Task<List<string>> AutoTagSongAsync(int songId)
        {
            if (string.IsNullOrEmpty(_connectionString)) throw new Exception("Connection string not configured.");

            using var conn = new MySqlConnection(_connectionString);
            var song = await conn.QueryFirstOrDefaultAsync<dynamic>("SELECT Title, Artist FROM songs WHERE Id = @Id", new { Id = songId });
            if (song == null) throw new Exception($"Không tìm thấy bài hát Id = {songId}");

            var prompt = $"Phân tích bài hát '{song.Title}' của '{song.Artist}' và trả về 3-5 thẻ thể loại (Pop, Rap, v.v.). Chỉ trả về danh sách, phân tách bằng dấu phẩy.";

            // Sử dụng cùng AI_SERVER_URL
            var body = new { messages = new[] { new { role = "user", content = prompt } }, temperature = 0.3, max_tokens = 50 };
            
            var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var res = await _http.PostAsync(AI_SERVER_URL, content);
            
            if (!res.IsSuccessStatusCode) throw new Exception("Lỗi gọi AI Local khi gắn thẻ.");

            var data = await res.Content.ReadFromJsonAsync<JsonElement>();
            var reply = data.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";

            var tags = new List<string>();
            foreach (var t in reply.Split(','))
            {
                var tag = t.Trim();
                if (!string.IsNullOrEmpty(tag))
                {
                    tags.Add(tag);
                    await conn.ExecuteAsync("INSERT INTO media_tags (SongId, Tag) VALUES (@SongId, @Tag)", new { SongId = songId, Tag = tag });
                }
            }
            return tags;
        }

        private static string GetFallbackReply(string message) => "👋 Xin chào! TuneBot đang sẵn sàng giúp bạn.";
    }
}
