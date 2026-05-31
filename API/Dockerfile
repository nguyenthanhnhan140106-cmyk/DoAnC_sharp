# 1. Tầng SDK để Build Source Code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy các file project (.csproj) của TOÀN BỘ 4 TẦNG vào để restore thư viện
COPY ["API/API.csproj", "API/"]
COPY ["Application/Application.csproj", "Application/"]
COPY ["Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["Domain/Domain.csproj", "Domain/"] 

# 🔥 Lệnh restore thần thánh hốt đầy đủ cả 4 mảnh ghép
RUN dotnet restore "API/API.csproj"

# Copy toàn bộ mã nguồn của tất cả các thư mục vào container
COPY . .
WORKDIR "/src/API"

# Tiến hành biên dịch dự án API (Lúc này đã có đủ ruột của cả 4 tầng)
RUN dotnet build "API.csproj" -c Release -o /app/build

# Publish ra file chạy chính thức
FROM build AS publish
RUN dotnet publish "API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 2. Tầng Runtime siêu nhẹ để chạy sản phẩm
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]