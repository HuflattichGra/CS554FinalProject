# 🚀 Vercel 部署指南（安全版本）

## ✅ 已完成的配置
- [x] Vercel 部署文件配置
- [x] 代码推送到 GitHub
- [x] 构建配置修复

## 📋 部署步骤

### 1. 准备云服务
**MongoDB Atlas:**
- 创建 MongoDB Atlas 账户
- 设置集群并获取连接字符串
- 配置网络访问权限 (0.0.0.0/0)

**Redis 服务:**
- 创建 Upstash Redis 实例
- 获取 Redis URL 和认证令牌

### 2. Vercel 部署
1. 访问: https://vercel.com/dashboard
2. 点击 **"New Project"** 
3. 选择 `HuflattichGra/CS554FinalProject` 仓库
4. 选择 `main` 分支（推荐）或 `junran` 分支
5. Framework Preset: 选择 `Vite`

### 3. 环境变量配置
在 Vercel 项目设置中添加以下环境变量：

```
MONGO_URL=your-mongodb-connection-string
MONGO_DB=DucKnight-CS554-Final
REDIS_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
SESSION_SECRET=your-generated-session-secret
```

⚠️ **安全提醒**: 所有敏感信息只能在 Vercel Dashboard 中配置，不要提交到代码仓库！

### 4. 生成 Session Secret
在本地终端运行以生成安全的会话密钥：
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔗 有用链接
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Upstash Redis](https://upstash.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)

## ⚠️ 安全提醒
- **绝不要**将数据库连接字符串、密码或 API 密钥提交到 Git 仓库
- 所有敏感信息只在 Vercel Dashboard 的环境变量中配置
- 定期轮换密码和 API 密钥

## 🎉 部署完成后
您的应用将可以通过 Vercel 分配的 URL 访问，每次推送代码都会自动部署！