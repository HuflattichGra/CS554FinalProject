# 🔧 您的 Vercel 环境变量配置

## 📋 在 Vercel Dashboard 中设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGO_URL` | `mongodb+srv://jtao11:jtao11@cluster0.7y8ar.mongodb.net/` | MongoDB Atlas 连接字符串 |
| `MONGO_DB` | `DucKnight-CS554-Final` | 数据库名称 |
| `REDIS_URL` | `https://funky-mammal-5343.upstash.io` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | `ARTfAAImcDJhOGM5NzVkZWQxNDg0MTEwOTVhYTFhMmI5MTYwYWZhNHAyNTM0Mw` | Upstash Redis 认证令牌 |
| `SESSION_SECRET` | `550b2ffb1bf5067d490b4ccbe9b23b54516cace02449e340f2c7bb2095de1fe34324801f9484e98b384ecd07827fbedf2c4d2de82a3deb779e07e2c9722fe64b` | 会话密钥（已生成） |

## 🚨 重要安全提醒

您的 MongoDB 连接字符串中包含了密码 `jtao11`，这可能存在安全风险。建议：

1. **修改 MongoDB 密码**：
   - 登录 MongoDB Atlas
   - 进入 Database Access → 编辑用户
   - 生成一个更强的密码

2. **更新连接字符串格式**：
   ```
   mongodb+srv://jtao11:<new-password>@cluster0.7y8ar.mongodb.net/
   ```

## 📝 下一步操作

### 1. ✅ Redis 配置完成
- Redis URL: `https://funky-mammal-5343.upstash.io`
- Token: `ARTfAAImcDJh...` (已获取)

### 2. 在 Vercel 中部署
1. 访问：https://vercel.com/dashboard
2. 点击 "New Project"
3. 选择 `CS554FinalProject` 仓库
4. 在 Environment Variables 中添加上表中的所有变量
5. 点击 "Deploy"

## 🔒 MongoDB Atlas 安全配置

确保在 MongoDB Atlas 中：
- Network Access 允许所有 IP (0.0.0.0/0) 用于 Vercel
- 或者添加 Vercel 的 IP 范围（推荐）

## 🎯 部署就绪！

您现在有了所有必需的环境变量，可以立即在 Vercel 中部署项目了！