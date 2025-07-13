import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './lib/errorHandler.js';
import { healthCheck, welcomePage } from './controller/SystemController.js';
import { welcomeLimiter, apiLimiter } from './lib/rateLimiters.js';

// 加载环境变量
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);



// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
}));
app.use(express.json());

// 日志中间件
app.use(requestLogger);

// 对欢迎页面应用宽松限流
app.use('/welcome', welcomeLimiter);

// 使用 API 路由（直接应用限流）
app.use('/api', apiLimiter, routes);

// 健康检查端点 - 用于心跳测试（直接应用限流）
app.get('/health', welcomeLimiter, healthCheck);

// 保留原有的欢迎路由
app.get('/welcome', welcomePage);

// Express 5 的全局错误处理中间件
// 并不是所有的报错是 500 错误，比如用户传入了相同的 id 时，需要返回 400 报错
app.use(errorHandler);

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