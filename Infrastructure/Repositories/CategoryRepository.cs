using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Application.Interfaces;
using Domain.Entities;
using Dapper;
using MySqlConnector;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly string _connectionString;

        public CategoryRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? string.Empty;
        }

        private IDbConnection CreateConnection() => new MySqlConnection(_connectionString);

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            using var connection = CreateConnection();
            return await connection.QueryAsync<Category>("SELECT * FROM categories");
        }

        public async Task<Category?> GetBySlugAsync(string slug)
        {
            using var connection = CreateConnection();
            return await connection.QuerySingleOrDefaultAsync<Category>(
                "SELECT * FROM categories WHERE Slug = @Slug", new { Slug = slug });
        }
    }
}
