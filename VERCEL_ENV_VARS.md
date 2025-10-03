# 🔧 Vercel 环境变量配置表

## 📋 在 Vercel Dashboard 中逐个添加以下环境变量：

### 变量 1: MongoDB 连接
```
Key: MONGO_URL
Value: mongodb+srv://jtao11:jtao11@cluster0.7y8ar.mongodb.net/
Environment: Production
```

### 变量 2: MongoDB 数据库名
```
Key: MONGO_DB
Value: DucKnight-CS554-Final
Environment: Production
```

### 变量 3: Redis URL
```
Key: REDIS_URL
Value: https://funky-mammal-5343.upstash.io
Environment: Production
```

### 变量 4: Redis Token
```
Key: UPSTASH_REDIS_REST_TOKEN
Value: ARTfAAImcDJhOGM5NzVkZWQxNDg0MTEwOTVhYTFhMmI5MTYwYWZhNHAyNTM0Mw
Environment: Production
```

### 变量 5: 会话密钥
```
Key: SESSION_SECRET
Value: 550b2ffb1bf5067d490b4ccbe9b23b54516cace02449e340f2c7bb2095de1fe34324801f9484e98b384ecd07827fbedf2c4d2de82a3deb779e07e2c9722fe64b
Environment: Production
```

## 📝 操作步骤：

1. **在 Vercel Project Settings 中**
2. **找到 "Environment Variables" 部分**
3. **逐个添加变量：**
   - 点击 "Add New"
   - 输入 Key (变量名)
   - 输入 Value (变量值)
   - 选择 Environment: Production
   - 点击 "Save"

## ⚠️ 重要提醒：
- **所有变量都选择 `Production` 环境**
- **Value 值要完整复制，不要遗漏任何字符**
- **Key 名称必须完全匹配，区分大小写**

## 📋 快速复制清单：
```
MONGO_URL=mongodb+srv://jtao11:jtao11@cluster0.7y8ar.mongodb.net/
MONGO_DB=DucKnight-CS554-Final
REDIS_URL=https://funky-mammal-5343.upstash.io
UPSTASH_REDIS_REST_TOKEN=ARTfAAImcDJhOGM5NzVkZWQxNDg0MTEwOTVhYTFhMmI5MTYwYWZhNHAyNTM0Mw
SESSION_SECRET=550b2ffb1bf5067d490b4ccbe9b23b54516cace02449e340f2c7bb2095de1fe34324801f9484e98b384ecd07827fbedf2c4d2de82a3deb779e07e2c9722fe64b
```