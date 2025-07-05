# Express.js 快速参考卡片 🚀

## 📋 常用命令

```bash
# 开发
pnpm run dev          # 启动开发服务器
pnpm run dev:debug    # 调试模式
pnpm start            # 生产环境

# 依赖
pnpm add express cors
pnpm add -D nodemon

# 测试 API
curl http://localhost:3001/api/todos
curl -X POST http://localhost:3001/api/todos -H "Content-Type: application/json" -d '{"text": "任务"}'
curl -X PATCH http://localhost:3001/api/todos/123 -H "Content-Type: application/json" -d '{"completed": true}'
curl -X DELETE http://localhost:3001/api/todos/123
```

---

## 🔧 基础代码模板

### 服务器设置
```javascript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});
```

### 路由模板
```javascript
// GET - 获取数据
app.get('/api/todos', async (req, res) => {
  try {
    // 处理逻辑
    res.json({ data: todos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - 创建数据
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    // 创建逻辑
    res.status(201).json({ data: newTodo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - 完整更新
app.put('/api/todos/:id', async (req, res) => {
  // 需要所有字段
});

// PATCH - 部分更新
app.patch('/api/todos/:id', async (req, res) => {
  // 只需修改字段
});

// DELETE - 删除
app.delete('/api/todos/:id', async (req, res) => {
  // 删除逻辑
});
```

---

## 🛠️ 中间件模板

```javascript
// 日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// 验证中间件
const validateTodo = (req, res, next) => {
  if (!req.body.text) {
    return res.status(400).json({ error: '内容不能为空' });
  }
  next();
};
```

---

## 🔄 RESTful API

| 操作 | 方法 | 路径 |
|------|------|------|
| 获取所有 | GET | `/api/todos` |
| 获取单个 | GET | `/api/todos/:id` |
| 创建 | POST | `/api/todos` |
| 完整更新 | PUT | `/api/todos/:id` |
| 部分更新 | PATCH | `/api/todos/:id` |
| 删除 | DELETE | `/api/todos/:id` |

**PUT vs PATCH**: PUT需要所有字段，PATCH只需修改字段

## 📊 响应格式

```javascript
// 成功
{ "data": [...], "message": "成功" }

// 错误  
{ "error": "错误描述" }
```

---

## 🔍 调试技巧

```javascript
// 查看请求信息
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// 环境变量
const PORT = process.env.PORT || 3001;
```

## 📚 状态码

- `200` - 成功
- `201` - 创建成功  
- `400` - 请求错误
- `404` - 资源不存在
- `500` - 服务器错误

## 🎯 最佳实践

- 使用 try-catch 处理异步
- 统一响应格式
- 验证输入数据
- 遵循 RESTful 设计
- 正确使用 HTTP 方法

---

*快速参考 - 随时查阅* 