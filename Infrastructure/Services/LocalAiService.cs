using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{
    public class LocalAiService : IAiService
    {
        private readonly HttpClient _http;
        private readonly string _aiServerUrl;
        private const string SYSTEM_PROMPT = @"Bạn là TuneBot - trợ lý AI thông minh của TuneVault. Trả lời ngắn gọn, thân thiện bằng tiếng Việt.";

        public LocalAiService(HttpClient http, IConfiguration config)
        {
            _http = http;
            _aiServerUrl = config["AiSettings:BaseUrl"] ?? "https://stitch-pronounce-frisk.ngrok-free.dev/v1/chat/completions";
        }

        public async IAsyncEnumerable<string> ChatStreamAsync(IEnumerable<MessageDTO> history, string message, [EnumeratorCancellation] CancellationToken ct = default)
        {
            var messages = new List<object> { new { role = "system", content = SYSTEM_PROMPT } };
            foreach (var h in history)
            {
                messages.Add(new { role = h.Role == "user" ? "user" : "assistant", content = h.Text });
            }
            messages.Add(new { role = "user", content = message });

            var body = new { messages, temperature = 0.7, max_tokens = 300, stream = true };
            var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

            var request = new HttpRequestMessage(HttpMethod.Post, _aiServerUrl) { Content = content };

            using var response = await _http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
            if (!response.IsSuccessStatusCode)
            {
                yield return "Xin lỗi, TuneBot đang bận hoặc hệ thống AI bị lỗi. Vui lòng thử lại sau.";
                yield break;
            }

            using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var reader = new StreamReader(stream);

            while (!reader.EndOfStream && !ct.IsCancellationRequested)
            {
                var line = await reader.ReadLineAsync(ct);
                if (string.IsNullOrWhiteSpace(line)) continue;
                if (line.StartsWith("data: "))
                {
                    var data = line.Substring(6);
                    if (data == "[DONE]") break;

                    string? chunkText = null;
                    try
                    {
                        using var doc = JsonDocument.Parse(data);
                        var choices = doc.RootElement.GetProperty("choices");
                        if (choices.GetArrayLength() > 0)
                        {
                            var delta = choices[0].GetProperty("delta");
                            if (delta.TryGetProperty("content", out var contentElement))
                            {
                                chunkText = contentElement.GetString();
                            }
                        }
                    }
                    catch
                    {
                        
                    }

                    if (!string.IsNullOrEmpty(chunkText))
                    {
                        yield return chunkText;
                    }
                }
            }
        }

        public async Task<List<string>> AutoTagAsync(string title, string artist, CancellationToken ct = default)
        {
            var prompt = $"Phân tích bài hát '{title}' của '{artist}' và trả về 3-5 thẻ thể loại. Bắt buộc chỉ trả về định dạng mảng chuỗi JSON hợp lệ, ví dụ: [\"Pop\", \"V-Pop\", \"Ballad\"]. KHÔNG trả về gì khác ngoài mảng JSON.";
            
            var body = new { messages = new[] { new { role = "user", content = prompt } }, temperature = 0.3, max_tokens = 50, stream = false };
            
            var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var res = await _http.PostAsync(_aiServerUrl, content, ct);
            
            if (!res.IsSuccessStatusCode) throw new Exception("Lỗi gọi AI Local khi gắn thẻ.");

            var data = await res.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
            var reply = data.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "[]";

            
            reply = reply.Replace("```json", "").Replace("```", "").Trim();
            
            var tags = new List<string>();
            try 
            {
                tags = JsonSerializer.Deserialize<List<string>>(reply) ?? new List<string>();
            } 
            catch 
            {
                
                foreach (var t in reply.Split(','))
                {
                    var tag = t.Trim().Replace("\"", "").Replace("[", "").Replace("]", "");
                    if (!string.IsNullOrEmpty(tag)) tags.Add(tag);
                }
            }

            return tags;
        }
    }
}
