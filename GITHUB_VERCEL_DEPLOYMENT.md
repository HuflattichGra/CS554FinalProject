# GitHub 集成部署到 Vercel 指南

## 🚀 完整部署流程

### 第一步：准备云数据库服务

#### 1. MongoDB Atlas 设置
1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费账户并登录
3. 创建新的集群（选择免费 M0 层）
4. 等待集群创建完成（约2-3分钟）
5. 点击 "Connect" → "Connect your application"
6. 复制连接字符串，格式如：
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```

#### 2. Redis 设置（使用 Upstash）
1. 访问 [Upstash](https://upstash.com/)
2. 创建免费账户并登录
3. 创建新的 Redis 数据库
4. 复制 Redis URL，格式如：
   ```
   redis://default:password@region-redis.upstash.io:port
   ```

### 第二步：提交代码到 GitHub

#### 1. 添加并提交所有更改
```bash
# 添加所有新文件和修改
git add .

# 提交更改
git commit -m "feat: add Vercel deployment configuration

- Add vercel.json configuration
- Create API route handler for Vercel
- Update client build configuration
- Add production environment variables
- Create Vercel-compatible server setup"

# 推送到 GitHub
git push origin junran
```

#### 2. 合并到主分支（如果需要）
```bash
# 切换到主分支
git checkout main

# 合并 junran 分支
git merge junran

# 推送主分支
git push origin main
```

### 第三步：在 Vercel 中设置 GitHub 集成

#### 1. 登录 Vercel
- 访问 [Vercel Dashboard](https://vercel.com/dashboard)
- 使用 GitHub 账户登录

#### 2. 创建新项目
1. 点击 **"New Project"** 按钮
2. 选择 **"Import Git Repository"**
3. 找到并选择您的 `CS554FinalProject` 仓库
4. 点击 **"Import"**

#### 3. 配置项目设置
- **Framework Preset**: 选择 "Other" 或 "Vite"
- **Root Directory**: 保持默认（`.`）
- **Build Command**: `npm run build`（已在 package.json 中配置）
- **Output Directory**: `client/dist`
- **Install Command**: 保持默认

#### 4. 设置环境变量
在 "Environment Variables" 部分添加：

| Name | Value | Environment |
|------|-------|-------------|
| `MONGO_URL` | `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/` | Production |
| `MONGO_DB` | `DucKnight-CS554-Final` | Production |
| `REDIS_URL` | `redis://default:password@region-redis.upstash.io:port` | Production |
| `SESSION_SECRET` | `your-super-secret-key-here` | Production |

⚠️ **重要**: 生成一个强密码作为 SESSION_SECRET，例如：
```bash
# 在本地生成随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 5. 部署
1. 点击 **"Deploy"** 按钮
2. 等待构建和部署完成（通常需要2-5分钟）
3. 部署成功后，您会得到一个类似 `https://your-app.vercel.app` 的URL

### 第四步：配置自动部署

Vercel 会自动为您的 GitHub 仓库设置 webhook，这意味着：
- 每次推送到 `main` 分支都会触发生产部署
- 推送到其他分支会创建预览部署
- Pull Request 会自动创建预览环境

### 第五步：测试部署

1. 访问您的 Vercel 应用 URL
2. 测试主要功能：
   - 用户注册/登录
   - 浏览大会列表
   - 创建新大会
   - 发布帖子和评论

### 故障排除

#### 常见问题：

1. **构建失败**
   - 检查 Vercel 构建日志
   - 确保所有依赖都在 package.json 中

2. **API 错误**
   - 验证环境变量是否正确设置
   - 检查数据库连接字符串

3. **CORS 错误**
   - 确保 `server/vercel.ts` 中的 CORS 配置正确

4. **数据库连接问题**
   - 确保 MongoDB Atlas 允许所有 IP 访问（0.0.0.0/0）
   - 验证数据库用户权限

### 监控和维护

- 使用 Vercel Dashboard 监控部署状态
- 查看 Function 日志以调试问题
- 设置 Vercel Analytics（可选）

### 本地开发与生产同步

```bash
# 拉取最新代码
git pull origin main

# 本地开发（使用 Docker）
docker-compose up

# 或者手动启动
cd server && npm start
cd client && npm run dev
```

## 🎉 完成！

您的应用现在已经部署到 Vercel，并且设置了自动部署。每次您推送代码到 GitHub，Vercel 都会自动更新您的应用。