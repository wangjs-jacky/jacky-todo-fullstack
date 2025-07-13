import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * 限流配置
 * 提供不同级别的请求限制中间件
 */

/**
 * 宽松的限流中间件
 * 用于欢迎页面和健康检查等公开端点
 * 每分钟最多100次请求
 */
export const welcomeLimiter = rateLimit({
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

/**
 * 严格的限流中间件
 * 用于 API 端点，提供更严格的访问控制
 * 每分钟最多30次请求
 */
export const apiLimiter = rateLimit({
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

/**
 * 自定义限流中间件工厂函数
 * 可以根据需要创建不同配置的限流中间件
 * 
 * @param maxRequests - 最大请求次数
 * @param windowMs - 时间窗口（毫秒）
 * @param errorMessage - 错误消息
 * @returns 配置好的限流中间件
 */
export const createCustomLimiter = (
  maxRequests: number,
  windowMs: number = 60 * 1000,
  errorMessage: string = '请求过于频繁'
) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: {
      error: errorMessage,
      message: `请稍后再试，${windowMs / 1000 / 60}分钟内最多允许${maxRequests}次请求`,
      timestamp: new Date().toISOString()
    },
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: errorMessage,
        message: `请稍后再试，${windowMs / 1000 / 60}分钟内最多允许${maxRequests}次请求`,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default {
  welcomeLimiter,
  apiLimiter,
  createCustomLimiter
}; 