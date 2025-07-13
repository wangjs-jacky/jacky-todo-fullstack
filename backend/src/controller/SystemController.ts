import { Request, Response } from 'express';

/**
 * 系统控制器
 * 处理系统级别的请求，如健康检查、欢迎页面等
 */

/**
 * 健康检查端点
 * 用于心跳测试和监控系统状态
 * 
 * @param req - Express 请求对象
 * @param res - Express 响应对象
 */
export const healthCheck = (req: Request, res: Response) => {
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
};

/**
 * 欢迎页面端点
 * 提供服务器基本信息和欢迎消息
 * 
 * @param req - Express 请求对象
 * @param res - Express 响应对象
 */
export const welcomePage = (req: Request, res: Response) => {
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
};

export default {
  healthCheck,
  welcomePage
}; 