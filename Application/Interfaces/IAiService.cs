using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAiService
    {
        IAsyncEnumerable<string> ChatStreamAsync(IEnumerable<MessageDTO> history, string message, CancellationToken ct = default);
        Task<List<string>> AutoTagAsync(string title, string artist, CancellationToken ct = default);
    }
}
