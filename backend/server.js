import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 简单的 GET / 路由 - Express 5 版本
app.get('/', async (req, res) => {
  try {
    const data = await fs.readFile('./data.json', 'utf8');
    const todos = JSON.parse(data);
    res.status(200).json({
      data: todos,
      count: todos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('读取 data.json 失败:', error);
    res.status(500).json({
      error: '读取数据失败',
      message: error.message
    });
  }
});

// 简单的 GET / 路由 - Express 5 版本
app.get('/welcome', (req, res) => {
  res.json({
    message: '欢迎使用 Express 5 后端服务器！',
    version: 'Express 5.1.0',
    status: 'success',
    timestamp: new Date().toISOString(),
    features: [
      '改进的错误处理',
      '更好的 TypeScript 支持',
      '新的路由功能',
      '性能优化'
    ]
  });
});

// Express 5 的错误处理中间件
app.use((err, req, res, next) => {
  console.error('Express 5 错误处理:', err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message,
    version: 'Express 5'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Express 5 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 访问 GET / 路由查看欢迎信息`);
  console.log(`✨ 使用 Express 5 的新特性！`);
}); 