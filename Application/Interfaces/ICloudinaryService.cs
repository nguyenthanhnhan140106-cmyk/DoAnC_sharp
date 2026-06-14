using System.IO;
using System.Threading.Tasks;

namespace Application.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadAudioAsync(Stream fileStream, string fileName);
        Task<string> UploadVideoAsync(Stream fileStream, string fileName);
        Task<string> UploadImageAsync(Stream fileStream, string fileName);
    }
}
