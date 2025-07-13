# Node.js Express 项目自定义错误处理方案

## 概述
自定义错误处理是后端开发中的重要概念，它让我们能够统一管理不同类型的错误，提供更好的用户体验和开发者体验。通过自定义错误类，我们可以区分业务错误和系统错误，返回合适的 HTTP 状态码和错误信息。

## 工具对比
- **原生 Error 类**: 基础选择，功能简单，适合小型项目
- **自定义 AppError 类**: 推荐方案，支持状态码和自定义属性，适合生产环境
- **第三方错误库**: 如 `http-errors`，功能丰富但增加依赖

## 前置条件
- 已安装 Node.js（版本 14.0 或以上）
- 有一个 Express.js 项目
- 使用 TypeScript（推荐）

## 详细步骤

### 方案一：基础自定义错误类（推荐新手）

#### 步骤 1: 创建自定义错误类
1. 在 `src/lib/` 目录下创建 `AppError.ts` 文件
2. 编写基础错误类：
   ```typescript
   class AppError extends Error {
     statusCode: number;
     errorMessage: string;
     constructor(message: string, statusCode: number) {
       super(message);
       // 扩展 Error 类
       this.statusCode = statusCode;
     }
   }

   export default AppError;
   ```

#### 步骤 2: 在控制器中使用自定义错误
1. 导入自定义错误类：
   ```typescript
   import AppError from '../lib/AppError.js';
   ```

2. 在错误处理中抛出自定义错误：
   ```typescript
   try {
     // 业务逻辑
   } catch (error) {
     logger.error({
       msg: '读取数据失败',
       reqId: req.id,
       error: error instanceof Error ? error.message : '未知错误',
       stack: error instanceof Error ? error.stack : undefined,
     });
     throw new AppError('读取数据失败', 500);
   }
   ```

#### 步骤 3: 配置全局错误处理中间件
1. 在 `server.ts` 中添加全局错误处理：
   ```typescript
   // Express 5 的全局错误处理中间件
   app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
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
   });
   ```

### 方案二：增强版自定义错误类（推荐生产环境）

#### 步骤 1: 创建增强版错误类
```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errorCode?: string;
  
  constructor(
    message: string, 
    statusCode: number, 
    isOperational: boolean = true,
    errorCode?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    
    // 确保错误堆栈正确
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
```

#### 步骤 2: 创建错误类型枚举
```typescript
// src/lib/errorTypes.ts
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export const ErrorMessages = {
  [ErrorType.VALIDATION_ERROR]: '数据验证失败',
  [ErrorType.NOT_FOUND]: '资源不存在',
  [ErrorType.UNAUTHORIZED]: '未授权访问',
  [ErrorType.FORBIDDEN]: '禁止访问',
  [ErrorType.CONFLICT]: '资源冲突',
  [ErrorType.INTERNAL_ERROR]: '服务器内部错误'
};
```

#### 步骤 3: 创建错误工厂函数
```typescript
// src/lib/errorFactory.ts
import AppError from './AppError.js';
import { ErrorType, ErrorMessages } from './errorTypes.js';

export const createError = (
  type: ErrorType,
  customMessage?: string,
  statusCode?: number
): AppError => {
  const message = customMessage || ErrorMessages[type];
  const defaultStatusCodes = {
    [ErrorType.VALIDATION_ERROR]: 400,
    [ErrorType.NOT_FOUND]: 404,
    [ErrorType.UNAUTHORIZED]: 401,
    [ErrorType.FORBIDDEN]: 403,
    [ErrorType.CONFLICT]: 409,
    [ErrorType.INTERNAL_ERROR]: 500
  };
  
  return new AppError(
    message,
    statusCode || defaultStatusCodes[type],
    true,
    type
  );
};
```

## 验证方法
1. 启动服务器：`npm run dev`
2. 测试错误场景：
   - 访问不存在的资源（应该返回 404）
   - 提交无效数据（应该返回 400）
   - 触发数据库错误（应该返回 500）
3. 检查错误响应格式是否统一
4. 确认日志记录正常工作

## 常见问题
**Q: 为什么我的自定义错误没有正确返回状态码？**
A: 确保全局错误处理中间件放在所有路由之后，并且正确设置了 `statusCode` 属性。

**Q: 如何区分业务错误和系统错误？**
A: 使用 `isOperational` 属性标记，业务错误为 `true`，系统错误为 `false`。

**Q: 自定义错误会影响日志记录吗？**
A: 不会，日志记录应该在抛出错误之前完成，错误处理中间件只负责响应格式。

**Q: 如何处理异步错误？**
A: 在 async/await 函数中使用 try-catch，或者使用 `express-async-errors` 库。

## 最佳实践

### 1. 错误分类
- **400 系列**: 客户端错误（验证失败、资源不存在等）
- **500 系列**: 服务器错误（数据库连接失败、系统异常等）

### 2. 错误信息设计
- 用户友好的错误消息
- 详细的开发者信息（仅在开发环境）
- 统一的错误响应格式

### 3. 日志记录
- 记录错误堆栈信息
- 包含请求上下文（用户ID、请求ID等）
- 区分错误级别（error、warn、info）

### 4. 安全考虑
- 不要暴露敏感信息
- 生产环境隐藏详细错误信息
- 使用错误代码而不是具体错误描述

## 参考资料
- [Express.js 错误处理官方文档](https://expressjs.com/en/guide/error-handling.html)
- [Node.js Error 类文档](https://nodejs.org/api/errors.html)
- [TypeScript 错误处理最佳实践](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [HTTP 状态码参考](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)

## 下一步学习
- 学习使用 `express-async-errors` 简化异步错误处理
- 了解错误监控和报警系统（如 Sentry）
- 学习错误恢复和重试机制
- 探索微服务架构中的错误处理策略
- 学习使用 OpenAPI 规范定义错误响应格式 