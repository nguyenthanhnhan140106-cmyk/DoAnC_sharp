namespace Domain.Entities
{
    public class Genre
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Song>? Songs { get; set; }
    }
}
