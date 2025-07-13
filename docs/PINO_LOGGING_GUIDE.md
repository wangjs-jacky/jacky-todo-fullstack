# Pino 日志体系使用指南

## 🎯 概述

本项目使用 Pino 作为日志库，提供了高性能、结构化的日志记录功能。

## 📦 安装的依赖

```bash
pnpm add pino pino-pretty
```

- `pino`: 高性能的 Node.js 日志库
- `pino-pretty`: 用于开发环境的美化输出

## 🏗️ 架构设计

### 1. 日志配置 (`src/lib/logger.ts`)

```typescript
// 环境变量配置
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// 开发环境：美化输出
const developmentConfig = {
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'SYS:standard',
    },
  },
};

// 生产环境：JSON 格式 + 敏感信息过滤
const productionConfig = {
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
    ],
  },
};
```

### 2. 日志中间件 (`src/middleware/logger.ts`)

#### 请求日志中间件
- 生成唯一的请求 ID
- 记录请求开始和完成时间
- 记录请求详情（方法、URL、状态码等）

#### 错误日志中间件
- 记录错误详情和堆栈信息
- 包含请求上下文信息

#### 性能监控中间件
- 检测慢请求（超过1秒）
- 记录请求耗时

### 3. 控制器日志集成

```typescript
import { createChildLogger } from '../lib/logger.js';

const logger = createChildLogger('TodoController');

// 使用结构化日志
logger.error({
  msg: '创建待办事项失败',
  reqId: req.id,
  todoText: text,
  error: error.message,
  stack: error.stack,
});
```

## 🚀 使用方法

### 1. 基本日志记录

```typescript
import logger from '../lib/logger.js';

// 不同级别的日志
logger.trace('跟踪信息');
logger.debug('调试信息');
logger.info('一般信息');
logger.warn('警告信息');
logger.error('错误信息');
logger.fatal('致命错误');
```

### 2. 结构化日志

```typescript
logger.info({
  msg: '用户登录',
  userId: user.id,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
});
```

### 3. 创建子日志器

```typescript
import { createChildLogger } from '../lib/logger.js';

const todoLogger = createChildLogger('TodoService');
const authLogger = createChildLogger('AuthService');

// 子日志器会自动添加模块标识
todoLogger.info({ msg: '获取待办事项列表' });
// 输出: { "level": "info", "module": "TodoService", "msg": "获取待办事项列表" }
```

### 4. 错误日志记录

```typescript
try {
  // 业务逻辑
} catch (error) {
  logger.error({
    msg: '操作失败',
    reqId: req.id,
    error: error.message,
    stack: error.stack,
    context: { userId, action },
  });
}
```

## ⚙️ 环境变量配置

```bash
# 日志级别
LOG_LEVEL=debug    # trace, debug, info, warn, error, fatal

# 环境
NODE_ENV=development  # development, production
```

## 📊 日志级别

| 级别 | 数值 | 说明 |
|------|------|------|
| trace | 10 | 最详细的调试信息 |
| debug | 20 | 调试信息 |
| info | 30 | 一般信息 |
| warn | 40 | 警告信息 |
| error | 50 | 错误信息 |
| fatal | 60 | 致命错误 |

## 🔍 开发环境输出示例

```
[12:34:56.789] INFO  Incoming request [id=abc123]
    method: "GET"
    url: "/api/todos"
    userAgent: "Mozilla/5.0..."
    ip: "::1"

[12:34:56.890] INFO  Request completed [id=abc123]
    method: "GET"
    url: "/api/todos"
    statusCode: 200
    duration: "101ms"
```

## 🏭 生产环境输出示例

```json
{
  "level": "info",
  "time": "2024-01-01T12:34:56.789Z",
  "msg": "Incoming request",
  "reqId": "abc123",
  "method": "GET",
  "url": "/api/todos",
  "userAgent": "Mozilla/5.0...",
  "ip": "::1"
}
```

## 🛡️ 安全特性

### 敏感信息过滤
生产环境会自动过滤以下敏感信息：
- `req.headers.authorization`
- `req.headers.cookie`
- `req.body.password`
- `req.body.token`

### 请求 ID 追踪
每个请求都有唯一的 ID，便于追踪和调试。

## 📈 性能监控

### 慢请求检测
自动检测并记录超过1秒的请求：

```json
{
  "level": "warn",
  "msg": "Slow request detected",
  "reqId": "abc123",
  "method": "POST",
  "url": "/api/todos",
  "duration": "1250.45ms"
}
```

## 🔧 自定义配置

### 修改日志格式

```typescript
// src/lib/logger.ts
const customConfig = {
  formatters: {
    level: (label: string) => ({ level: label.toUpperCase() }),
  },
  messageKey: 'message', // 默认是 'msg'
};
```

### 添加自定义字段

```typescript
const logger = pino({
  ...baseConfig,
  base: {
    service: 'todo-api',
    version: '1.0.0',
  },
});
```

## 📝 最佳实践

1. **使用结构化日志**：避免字符串拼接，使用对象格式
2. **包含上下文信息**：添加 reqId、用户ID、操作类型等
3. **合理使用日志级别**：不要过度使用 debug 级别
4. **记录错误堆栈**：生产环境也要记录完整的错误信息
5. **使用子日志器**：按模块分类日志
6. **避免敏感信息**：确保不记录密码、token 等敏感数据

## 🚨 注意事项

1. **性能影响**：Pino 是异步日志，不会阻塞主线程
2. **磁盘空间**：定期清理日志文件
3. **日志轮转**：生产环境建议使用 logrotate 等工具
4. **监控集成**：可以将日志发送到 ELK、Splunk 等系统 