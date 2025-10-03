# Vercel 部署指南

## 部署步骤

### 1. 准备数据库服务

由于 Vercel 是无服务器平台，您需要使用云数据库服务：

#### MongoDB
- 使用 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- 创建免费集群
- 获取连接字符串

#### Redis  
- 使用 [Upstash Redis](https://upstash.com/)
- 创建免费 Redis 实例
- 获取连接 URL

### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB=DucKnight-CS554-Final
REDIS_URL=redis://default:password@host:port
SESSION_SECRET=your-secret-key-here
```

### 3. 部署到 Vercel

#### 方法一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

#### 方法二：通过 GitHub 集成
1. 将代码推送到 GitHub
2. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "New Project"
4. 选择您的 GitHub 仓库
5. 配置环境变量
6. 点击 "Deploy"

### 4. 重要注意事项

1. **文件上传限制**: Vercel 无服务器函数不支持持久文件存储，如需图片上传功能，建议使用：
   - Cloudinary
   - AWS S3
   - Vercel Blob Storage

2. **数据库连接**: 确保使用连接池来优化数据库连接

3. **环境变量**: 生产环境的敏感信息必须在 Vercel Dashboard 中配置

## 项目结构调整

- `api/[...slug].ts`: Vercel API 路由处理器
- `server/vercel.ts`: 适配 Vercel 的服务器代码
- `vercel.json`: Vercel 部署配置
- `client/.env.production`: 生产环境配置

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发环境 (使用 Docker)
docker-compose up

# 或者分别启动服务
cd server && npm start
cd client && npm run dev
```

## 故障排除

1. **API 路由问题**: 确保所有 API 调用都使用 `/api` 前缀
2. **CORS 错误**: 检查 `server/vercel.ts` 中的 CORS 配置
3. **数据库连接**: 验证 MongoDB 和 Redis 连接字符串

## 性能优化

- 启用 Vercel 的 Edge Functions（如果需要）
- 使用 Vercel Analytics 监控性能
- 配置适当的缓存策略