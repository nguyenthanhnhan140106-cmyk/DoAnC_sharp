using System;
using System.IO;
using System.Threading.Tasks;
using Application.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Infrastructure.Configuration;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary = null!;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var settings = config.Value;
            var cloudName = string.IsNullOrEmpty(settings?.CloudName) ? "dawcwuwmm" : settings.CloudName;
            var apiKey = string.IsNullOrEmpty(settings?.ApiKey) ? "811443711198311" : settings.ApiKey;
            var apiSecret = string.IsNullOrEmpty(settings?.ApiSecret) ? "I6TUr3BrQr1vlizpbvQY1Pioawg" : settings.ApiSecret;

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        private void EnsureCloudinaryIsConfigured()
        {
            if (_cloudinary == null)
            {
                throw new Exception("Cloudinary chưa được cấu hình. Vui lòng cập nhật appsettings.json.");
            }
        }

        public async Task<string> UploadAudioAsync(Stream fileStream, string fileName)
        {
            EnsureCloudinaryIsConfigured();
            if (fileStream == null || fileStream.Length == 0) return string.Empty;

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "tunevault/audio"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
                throw new Exception($"Cloudinary Audio Upload Error: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }

        public async Task<string> UploadVideoAsync(Stream fileStream, string fileName)
        {
            EnsureCloudinaryIsConfigured();
            if (fileStream == null || fileStream.Length == 0) return string.Empty;

            var uploadParams = new VideoUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "tunevault/video"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
                throw new Exception($"Cloudinary Video Upload Error: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }

        public async Task<string> UploadImageAsync(Stream fileStream, string fileName)
        {
            EnsureCloudinaryIsConfigured();
            if (fileStream == null || fileStream.Length == 0) return string.Empty;

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = "tunevault/images",
                Transformation = new Transformation().Width(500).Height(500).Crop("fill")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
                throw new Exception($"Cloudinary Image Upload Error: {uploadResult.Error.Message}");

            return uploadResult.SecureUrl.ToString();
        }
    }
}
