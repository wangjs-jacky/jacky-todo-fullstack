import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// 配置宽松的限流中间件 - 用于欢迎页面和健康检查
const welcomeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟时间窗口
  max: 100, // 每分钟最多100次请求
  message: {
    error: '请求过于频繁',
    message: '请稍后再试，每分钟最多允许100次请求',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: '请求过于频繁',
      message: '请稍后再试，每分钟最多允许100次请求',
      retryAfter: Math.ceil(60), // 1分钟后重试
      timestamp: new Date().toISOString()
    });
  }
});

// 配置严格的限流中间件 - 用于 API 端点
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟时间窗口
  max: 30, // 每分钟最多30次请求
  message: {
    error: 'API 请求过于频繁',
    message: '请稍后再试，每分钟最多允许30次 API 请求',
    timestamp: new Date().toISOString()
  },
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'API 请求过于频繁',
      message: '请稍后再试，每分钟最多允许30次 API 请求',
      retryAfter: Math.ceil(60), // 1分钟后重试
      timestamp: new Date().toISOString()
    });
  }
});

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
}));
app.use(express.json());

// 对欢迎页面和健康检查应用宽松限流
app.use('/welcome', welcomeLimiter);
app.use('/health', welcomeLimiter);

// 对 API 路由应用严格限流
app.use('/api', apiLimiter);

// 使用 API 路由
app.use('/api', routes);

// 健康检查端点 - 用于心跳测试
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: '服务器运行正常',
    version: 'Express 5.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    features: [
      '改进的错误处理',
      '更好的 TypeScript 支持',
      '新的路由功能',
      '性能优化'
    ]
  });
});

// 保留原有的欢迎路由
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
  console.log(`💓 健康检查: GET /health - 心跳测试端点`);
  console.log(`📝 欢迎页面: GET /welcome - 查看欢迎信息`);
  console.log(`✨ 使用 Express 5 + TypeScript 的新特性！`);
  console.log(`🛡️  分级限流配置:`);
  console.log(`   📊 欢迎页面 & 健康检查: 每分钟 100 次请求`);
  console.log(`   🔒 API 端点: 每分钟 30 次请求`);
  console.log(`🔄 RESTful API 端点:`);
  console.log(`   GET    /api/todos     - 获取所有待办事项`);
  console.log(`   GET    /api/todos/:id - 获取单个待办事项`);
  console.log(`   POST   /api/todos     - 创建待办事项`);
  console.log(`   PUT    /api/todos/:id - 完整更新待办事项`);
  console.log(`   PATCH  /api/todos/:id - 部分更新待办事项`);
  console.log(`   DELETE /api/todos/:id - 删除待办事项`);
}); 