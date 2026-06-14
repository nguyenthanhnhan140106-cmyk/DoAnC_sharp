namespace Application.Interfaces
{
    public interface IAuthorizeRequest
    {
        int UserId { get; }
    }

    public interface IRequirePlaylistOwnership : IAuthorizeRequest
    {
        int PlaylistId { get; }
    }
}
