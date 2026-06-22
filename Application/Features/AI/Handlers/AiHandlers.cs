using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Application.Features.AI.Queries;
using Application.Features.AI.Commands;
using Application.Interfaces;

namespace Application.Features.AI.Handlers
{
    public class ChatQueryHandler : IStreamRequestHandler<ChatQuery, string>
    {
        private readonly IAiService _aiService;

        public ChatQueryHandler(IAiService aiService)
        {
            _aiService = aiService;
        }

        public async IAsyncEnumerable<string> Handle(ChatQuery request, [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await foreach (var chunk in _aiService.ChatStreamAsync(request.History, request.Message, cancellationToken))
            {
                yield return chunk;
            }
        }
    }

    public class AutoTagCommandHandler : IRequestHandler<AutoTagCommand, List<string>>
    {
        private readonly IAiService _aiService;
        private readonly ISongRepository _songRepository;

        public AutoTagCommandHandler(IAiService aiService, ISongRepository songRepository)
        {
            _aiService = aiService;
            _songRepository = songRepository;
        }

        public async Task<List<string>> Handle(AutoTagCommand request, CancellationToken cancellationToken)
        {
            var song = await _songRepository.GetByIdAsync(request.SongId);
            if (song == null) throw new Exception($"Không tìm thấy bài hát Id = {request.SongId}");

            var tags = await _aiService.AutoTagAsync(song.Title, song.Artist, cancellationToken);

            if (tags.Count > 0)
            {
                await _songRepository.AddTagsToSongAsync(request.SongId, tags);
            }

            return tags;
        }
    }
}
