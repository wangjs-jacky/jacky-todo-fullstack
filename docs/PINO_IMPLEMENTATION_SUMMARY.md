# Node.js 项目日志系统接入与 Pino 多目标输出配置

## 概述
日志系统是每个后端项目不可或缺的部分。它能帮助开发者追踪请求、排查问题、监控性能。Pino 是 Node.js 生态中非常流行的高性能日志库，支持结构化日志、灵活的格式化和多目标输出（如同时输出到控制台和文件）。本指南将手把手教你如何在项目中集成 Pino，并实现开发环境下的美化输出+文件保存，生产环境下的安全日志落盘。

## 工具对比

| 工具         | 优点                   | 缺点                | 适用场景         |
|--------------|------------------------|---------------------|------------------|
| **Pino**     | 性能极高，结构化输出，支持多目标，生态好 | 配置较多，需注意类型兼容 | 生产、开发通用    |
| Winston      | 插件丰富，格式灵活     | 性能略低于 Pino     | 需要多种格式时    |
| Bunyan       | 结构化输出，支持流     | 生态不如 Pino       | 传统 Node 项目    |

## 前置条件
- 已安装 Node.js（建议 14.0 及以上，推荐 16+）
- 已有 Node.js 项目
- 已安装 pnpm 或 npm
- 需要日志落盘和控制台美化输出的需求

## Pino 最佳实践结构

### 性能优化原则
1. **异步日志记录**：Pino 默认异步写入，不会阻塞主线程
2. **结构化日志**：使用 JSON 格式，便于解析和分析
3. **序列化优化**：使用内置序列化器精简对象大小
4. **级别控制**：生产环境使用 `info` 级别，减少日志量

### HTTP 请求日志最佳实践
1. **中间件位置**：日志中间件必须在路由之前，确保捕获所有请求
2. **请求 ID**：为每个请求生成唯一 ID，便于追踪
3. **敏感信息脱敏**：自动隐藏密码、token 等敏感数据
4. **性能监控**：记录请求耗时，便于性能分析

## 详细步骤

### 步骤 1: 安装依赖

```bash
npm install pino pino-pretty
# 或
pnpm add pino pino-pretty
```

### 步骤 2: 创建日志工具文件

#### 2.1 创建 `src/lib/logger.ts`

```typescript
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// 基础配置
const baseConfig = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  // 使用内置序列化器，优化性能
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
  // 生成请求 ID，便于追踪
  genReqId: (req: any) => req.id || req.headers['x-request-id'] || Math.random().toString(36).substring(2, 15),
};

// 开发环境配置：控制台美化 + 文件输出
const developmentConfig = {
  ...baseConfig,
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg} [id={reqId}]',
        },
      },
      {
        target: 'pino/file',
        options: {
          destination: './logs/app.log',
          mkdir: true,
        },
      },
    ],
  },
};

// 生产环境配置：文件输出 + 敏感信息脱敏
const productionConfig = {
  ...baseConfig,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.secret',
    ],
  },
  transport: {
    target: 'pino/file',
    options: {
      destination: './logs/app.log',
      mkdir: true,
    },
  },
};

const logger = pino(isDevelopment ? developmentConfig : productionConfig);

// 子日志记录器，用于模块化日志
export const createChildLogger = (name: string) => {
  return logger.child({ module: name });
};

export default logger;
```

### 2.3 子日志记录器的作用和使用

`createChildLogger` 函数用于创建**子日志记录器**，它继承父日志记录器的所有配置，但可以添加额外的上下文信息。

#### 主要作用
1. **模块化日志记录**：为不同的模块或组件创建独立的日志记录器
2. **添加上下文信息**：自动为每条日志添加模块标识
3. **保持配置一致性**：继承父日志记录器的所有配置（级别、格式、输出目标等）

#### 使用示例

```typescript
// 在 TodoController 中使用
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('TodoController');

// 这样记录的日志会自动包含模块信息
logger.info('Creating new todo'); // 输出: {"module":"TodoController","msg":"Creating new todo"}
logger.error('Failed to create todo'); // 输出: {"module":"TodoController","msg":"Failed to create todo"}
```

#### 实际效果对比
- **没有子日志记录器**：`{"msg":"Creating new todo"}`
- **使用子日志记录器**：`{"module":"TodoController","msg":"Creating new todo"}`

#### 优势
1. **便于调试**：快速定位日志来源模块
2. **日志过滤**：可以根据模块名过滤日志
3. **代码组织**：每个模块使用自己的日志记录器，代码更清晰
4. **性能优化**：子日志记录器共享父记录器的配置，避免重复初始化



### 步骤 3: 创建日志中间件（必须在路由之前）

#### 3.1 创建 `src/middleware/logger.ts`


```typescript
import logger from '../lib/logger';

export const loggerMiddleware = (req: any, res: any, next: any) => {
  const startTime = process.hrtime.bigint();
  
  // 记录请求开始
  logger.info({ 
    req, 
    msg: 'Incoming request',
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
  });

  // 监听响应完成事件
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // 毫秒
    
    logger.info({ 
      req, 
      res, 
      duration,
      msg: 'Request completed',
      statusCode: res.statusCode,
    });
  });

  next();
};
```

#### 3.2 在主应用中注册中间件

```typescript
// 在 server.ts 中
import express from 'express';
import { loggerMiddleware } from './middleware/logger';

const app = express();

// 日志中间件必须在所有路由之前
app.use(loggerMiddleware);

// 其他中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/todos', todoRoutes);
```

### 步骤 4: 在控制器中使用子日志记录器

```typescript
// 在 TodoController.ts 中
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('TodoController');

export class TodoController {
  async createTodo(req: Request, res: Response) {
    try {
      logger.info('Creating new todo', { 
        title: req.body.title,
        userId: req.user?.id, // 如果有用户信息
      });
      
      // 业务逻辑...
      const newTodo = await todoService.create(req.body);
      
      logger.info('Todo created successfully', { 
        id: newTodo.id,
        title: newTodo.title,
      });
      
      res.status(201).json(newTodo);
    } catch (error) {
      logger.error('Failed to create todo', { 
        error: error.message,
        stack: error.stack,
        title: req.body.title,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### 步骤 5: 运行和验证

1. 启动服务：`npm run dev` 或 `pnpm run dev`
2. 访问任意接口
3. 检查 `backend/logs/app.log` 是否生成并有内容
4. 控制台应有彩色美化日志输出



## 验证方法

- **控制台**：应看到彩色、格式化的日志
- **文件**：`backend/logs/app.log` 文件应自动生成，并持续写入日志
- **内容**：日志内容应简洁、无敏感信息（如密码、token）
- **模块标识**：使用子日志记录器的日志应包含 `module` 字段，如 `{"module":"TodoController","msg":"Creating new todo"}`
- **请求追踪**：每个请求都有唯一的 `reqId`，便于追踪完整的请求流程
- **性能监控**：日志中包含请求耗时（duration），便于性能分析



## 常见问题

**Q: 为什么日志文件没有生成？**  
A: 检查 transport 配置是否为 `targets` 数组，且 `pino/file` 的 `destination` 路径正确。确认有日志输出行为。

**Q: 报错 “option.transport.targets do not allow custom level formatters”？**  
A: 不能在多目标输出下自定义 `formatters.level`，请移除 `formatters` 字段。

**Q: 日志内容太多/太杂怎么办？**  
A: 使用 `serializers` 精简 req、res、err 对象，或自定义序列化逻辑。

**Q: 如何脱敏敏感信息？**  
A: 使用 `redact` 字段，配置需要隐藏的路径。

**Q: pino-pretty 的作用是什么？**  
A: pino-pretty 是 Pino 的格式化工具，主要作用包括：
1. **美化输出**：将 JSON 格式的日志转换为人类可读的彩色文本
2. **开发体验**：在开发环境中提供友好的日志显示
3. **自定义格式**：支持自定义时间格式、颜色、字段显示等
4. **性能影响**：仅在开发环境使用，生产环境使用原始 JSON 格式以保持性能

**Q: 为什么生产环境不使用 pino-pretty？**  
A: 生产环境不使用 pino-pretty 的原因：
1. **性能考虑**：格式化会增加 CPU 开销，影响应用性能
2. **存储效率**：JSON 格式更紧凑，节省存储空间
3. **解析便利**：JSON 格式便于日志分析工具处理
4. **标准化**：符合日志收集和分析的最佳实践

## 参考资料

- [Pino 官方文档](https://getpino.io/#/)
- [Pino Transports 官方说明](https://getpino.io/#/docs/transports)
- [Pino Serializers 官方说明](https://getpino.io/#/docs/serializers)
- [Pino 多目标输出 issues 讨论](https://github.com/pinojs/pino/issues/1334)

## 下一步学习

- 了解如何将日志发送到远程日志服务（如 ELK、Datadog）
- 学习日志分析与可视化工具的接入
- 深入研究 Pino 的自定义序列化和脱敏策略
- 探索日志轮转（log rotation）方案，防止日志文件过大 