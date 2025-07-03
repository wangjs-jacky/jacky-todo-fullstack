# Express.js 快速参考卡片 🚀

## 📋 常用命令

### 开发环境
```bash
# 启动开发服务器（自动重启）
pnpm run dev

# 启动调试模式
pnpm run dev:debug

# 生产环境启动
pnpm start

# 安装依赖
pnpm add express cors
pnpm add -D nodemon
```

### 测试 API
```bash
# 测试 GET 请求
curl http://localhost:3001/
curl http://localhost:3001/welcome

# 测试 POST 请求
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "新任务"}'

# 检查端口占用
lsof -i :3001
lsof -i :9229
```

---

## 🔧 基础代码模板

### 1. 服务器设置
```javascript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});
```

### 2. GET 路由
```javascript
app.get('/api/todos', async (req, res) => {
  try {
    const data = await readFile('./data.json', 'utf8');
    const todos = JSON.parse(data);
    res.json({
      success: true,
      data: todos,
      count: todos.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 3. POST 路由
```javascript
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '待办事项内容不能为空'
      });
    }
    
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: false
    };
    
    // 保存到文件或数据库
    res.status(201).json({
      success: true,
      data: newTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 4. PUT 路由
```javascript
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, completed } = req.body;
    
    // 更新逻辑
    const updatedTodo = { id: parseInt(id), text, completed };
    
    res.json({
      success: true,
      data: updatedTodo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 5. DELETE 路由
```javascript
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 删除逻辑
    
    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## 🛠️ 中间件模板

### 1. 日志中间件
```javascript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### 2. 错误处理中间件
```javascript
app.use((err, req, res, next) => {
  console.error('错误:', err.stack);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});
```

### 3. 验证中间件
```javascript
const validateTodo = (req, res, next) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '待办事项内容不能为空'
    });
  }
  next();
};

// 使用
app.post('/api/todos', validateTodo, async (req, res) => {
  // 处理逻辑
});
```

---

## 📊 响应格式

### 成功响应
```javascript
{
  "success": true,
  "data": [...],
  "count": 3,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 错误响应
```javascript
{
  "success": false,
  "error": "错误描述",
  "message": "详细错误信息",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔍 调试技巧

### 1. 查看请求信息
```javascript
app.use((req, res, next) => {
  console.log('请求体:', req.body);
  console.log('查询参数:', req.query);
  console.log('路径参数:', req.params);
  next();
});
```

### 2. 环境变量
```javascript
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
```

### 3. 调试模式启动
```bash
# 使用 nodemon 调试
pnpm run dev:debug

# 在 Chrome 中打开 chrome://inspect
npm run dev:chrome
```

---

## 📚 常用状态码

- `200` - OK (成功)
- `201` - Created (创建成功)
- `400` - Bad Request (请求错误)
- `401` - Unauthorized (未授权)
- `404` - Not Found (资源不存在)
- `500` - Internal Server Error (服务器错误)

---

## 🎯 最佳实践

1. **始终使用 try-catch** 处理异步操作
2. **统一响应格式** 便于前端处理
3. **添加适当的日志** 便于调试
4. **验证输入数据** 确保数据安全
5. **使用环境变量** 管理配置
6. **遵循 RESTful 设计** 规范 API

---

*快速参考 - 随时查阅* 