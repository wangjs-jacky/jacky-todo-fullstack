import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger.js';

// 生成请求 ID
const generateRequestId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// 日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // 生成请求 ID
  const requestId = generateRequestId();
  req.id = requestId;
  
  // 记录请求开始
  const startTime = Date.now();
  
  logger.info({
    msg: 'Incoming request',
    reqId: requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    req: req,
  });

  // 监听响应完成
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[logLevel]({
      msg: 'Request completed',
      reqId: requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      res: res,
    });
  });

  next();
};

// 错误日志中间件
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    msg: 'Request error',
    reqId: req.id,
    method: req.method,
    url: req.url,
    error: err,
    stack: err.stack,
  });
  
  next(err);
};

// 性能监控中间件
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒
    
    if (duration > 1000) { // 超过1秒的请求
      logger.warn({
        msg: 'Slow request detected',
        reqId: req.id,
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
      });
    }
  });
  
  next();
}; 