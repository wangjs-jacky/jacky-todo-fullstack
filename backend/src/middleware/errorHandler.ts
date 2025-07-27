import { Request, Response, NextFunction } from 'express';
import AppError from './AppError.js';

/**
 * 全局错误处理中间件
 * 处理应用程序中抛出的所有错误
 * 
 * @param err - 错误对象
 * @param req - Express 请求对象
 * @param res - Express 响应对象
 * @param next - Express 下一个中间件函数
 */
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const {
    statusCode = 500,
    message = '服务器内部错误',
  } = err;

  // 自定义错误响应
  res.status(statusCode).json({
    rootMessageId: req.id,
    error: message,
    timestamp: new Date().toISOString()
  });
};

export default errorHandler; 