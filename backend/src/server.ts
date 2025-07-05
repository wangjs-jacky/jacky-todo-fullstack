import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

// 加载环境变量
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
}));
app.use(express.json());

// 使用 API 路由
app.use('/api', routes);

// 简单的 GET /welcome 路由 - Express 5 版本
app.get('/welcome', (req: Request, res: Response) => {
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
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express 5 错误处理:', err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message,
    version: 'Express 5',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Express 5 TypeScript 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 访问 GET /welcome 路由查看欢迎信息`);
  console.log(`✨ 使用 Express 5 + TypeScript 的新特性！`);
  console.log(`🔄 RESTful API 端点:`);
  console.log(`   GET    /api/todos     - 获取所有待办事项`);
  console.log(`   GET    /api/todos/:id - 获取单个待办事项`);
  console.log(`   POST   /api/todos     - 创建待办事项`);
  console.log(`   PUT    /api/todos/:id - 完整更新待办事项`);
  console.log(`   PATCH  /api/todos/:id - 部分更新待办事项`);
  console.log(`   DELETE /api/todos/:id - 删除待办事项`);
}); 