# HTTP 429 状态码与 API 限流机制详解

## 概述
HTTP 429 状态码是专门为 API 限流设计的标准响应码，当客户端发送请求过于频繁时，服务器会返回 429 状态码来保护服务器资源，防止恶意攻击和过载。就像银行限制取款次数一样，API 限流确保每个用户都能公平地使用服务。

## 工具对比
- **express-rate-limit**: Node.js 最流行的限流中间件，配置简单，功能完整
- **rate-limiter-flexible**: 更灵活的限流方案，支持多种存储后端
- **koa-ratelimit**: Koa 框架的限流中间件
- **fastify-rate-limit**: Fastify 框架的限流插件

## 前置条件
- 已安装 Node.js（版本 14.0 或以上）
- 已安装 Express.js：`npm install express`
- 已安装 express-rate-limit：`npm install express-rate-limit`
- 了解基本的 JavaScript 语法

## 详细步骤

### 方案一：基础限流配置（推荐新手）

#### 步骤 1: 安装依赖包
1. 打开终端，进入项目目录
2. 执行安装命令：
   ```bash
   npm install express-rate-limit
   ```
3. 预期结果：看到 `express-rate-limit` 出现在 `package.json` 的 `dependencies` 中

#### 步骤 2: 创建基础限流配置
1. 在 `server.js` 或 `app.js` 中添加限流中间件：
   ```javascript
   import express from 'express';
   import rateLimit from 'express-rate-limit';

   const app = express();

   // 基础限流配置
   const limiter = rateLimit({
     windowMs: 1000, // 1秒时间窗口
     max: 10, // 最多10次请求
     message: {
       error: '请求过于频繁',
       message: '请稍后再试，每秒最多允许10次请求',
       timestamp: new Date().toISOString()
     }
   });

   // 应用限流中间件
   app.use(limiter);
   ```

#### 步骤 3: 自定义错误处理
1. 添加自定义错误处理器：
   ```javascript
   const limiter = rateLimit({
     windowMs: 1000,
     max: 10,
     standardHeaders: true, // 返回标准的 RateLimit-* headers
     legacyHeaders: false,  // 不返回 X-RateLimit-* headers
     handler: (req, res) => {
       res.status(429).json({
         error: '请求过于频繁',
         message: '请稍后再试，每秒最多允许10次请求',
         retryAfter: Math.ceil(1000 / 1000), // 1秒后重试
         timestamp: new Date().toISOString()
       });
     }
   });
   ```

### 方案二：高级限流配置（推荐生产环境）

#### 步骤 1: 配置标准响应头
1. 使用标准的 HTTP 限流头信息：
   ```javascript
   const limiter = rateLimit({
     windowMs: 60000, // 1分钟时间窗口
     max: 100, // 每分钟最多100次请求
     standardHeaders: true, // 启用标准头信息
     legacyHeaders: false,  // 禁用旧版头信息
     handler: (req, res) => {
       res.status(429).json({
         error: '请求频率超限',
         message: '请稍后再试，每分钟最多允许100次请求',
         retryAfter: Math.ceil(60000 / 1000), // 60秒后重试
         timestamp: new Date().toISOString()
       });
     }
   });
   ```

#### 步骤 2: 为不同路由设置不同限流规则
1. 创建多个限流器：
   ```javascript
   // 全局限流 - 宽松
   const globalLimiter = rateLimit({
     windowMs: 60000,
     max: 1000,
     standardHeaders: true
   });

   // API 限流 - 中等
   const apiLimiter = rateLimit({
     windowMs: 60000,
     max: 100,
     standardHeaders: true
   });

   // 登录限流 - 严格
   const loginLimiter = rateLimit({
     windowMs: 60000,
     max: 5,
     standardHeaders: true
   });

   // 应用限流器
   app.use(globalLimiter);           // 全局限流
   app.use('/api', apiLimiter);      // API 路由限流
   app.use('/auth/login', loginLimiter); // 登录路由限流
   ```

#### 步骤 3: 配置 Redis 存储（可选）
1. 安装 Redis 依赖：
   ```bash
   npm install redis
   ```
2. 配置 Redis 存储：
   ```javascript
   import Redis from 'redis';
   import rateLimit from 'express-rate-limit';
   import RedisStore from 'rate-limit-redis';

   const redisClient = Redis.createClient({
     host: 'localhost',
     port: 6379
   });

   const limiter = rateLimit({
     store: new RedisStore({
       client: redisClient,
       prefix: 'rate-limit:'
     }),
     windowMs: 60000,
     max: 100,
     standardHeaders: true
   });
   ```

## 验证方法

### 方法一：使用 curl 测试
1. 快速发送多个请求：
   ```bash
   for i in {1..15}; do 
     curl -s http://localhost:3001/api/todos | jq '.message'; 
   done
   ```
2. 预期结果：前10个请求成功（200），后5个请求被限流（429）

### 方法二：使用测试脚本
1. 创建测试文件 `test-rate-limit.js`：
   ```javascript
   import fetch from 'node-fetch';

   async function testRateLimit() {
     console.log('🚀 发送 15 个请求测试限流...');
     
     const promises = [];
     for (let i = 1; i <= 15; i++) {
       const promise = fetch('http://localhost:3001/api/todos')
         .then(async (response) => {
           const data = await response.json();
           return {
             requestId: i,
             status: response.status,
             data: data
           };
         });
       promises.push(promise);
     }
     
     const results = await Promise.all(promises);
     
     const successful = results.filter(r => r.status === 200);
     const rateLimited = results.filter(r => r.status === 429);
     
     console.log(`✅ 成功请求: ${successful.length}`);
     console.log(`🚫 被限流请求: ${rateLimited.length}`);
   }

   testRateLimit();
   ```
2. 运行测试：
   ```bash
   node test-rate-limit.js
   ```

### 方法三：检查响应头
1. 发送请求并检查响应头：
   ```bash
   curl -I http://localhost:3001/api/todos
   ```
2. 查看限流相关头信息：
   - `RateLimit-Limit`: 限制的最大请求数
   - `RateLimit-Remaining`: 剩余可请求次数
   - `RateLimit-Reset`: 限流重置时间
   - `RateLimit-Used`: 已使用的请求次数

## 常见问题

**Q: 为什么使用 429 状态码而不是其他状态码？**
A: 429 是 HTTP 标准专门为限流设计的，语义明确，客户端能自动识别和处理。其他状态码如 400（请求错误）、403（禁止访问）、500（服务器错误）都不适合表示频率限制。

**Q: legacyHeaders 和 standardHeaders 有什么区别？**
A: legacyHeaders 返回 `X-RateLimit-*` 头信息（已废弃），standardHeaders 返回 `RateLimit-*` 头信息（标准）。推荐使用 standardHeaders，因为它是 HTTP 标准，兼容性更好。

**Q: 如何为不同的用户设置不同的限流规则？**
A: 可以使用 `keyGenerator` 选项自定义限流键：
```javascript
const limiter = rateLimit({
  keyGenerator: (req) => {
    return req.user?.id || req.ip; // 按用户ID或IP限流
  },
  windowMs: 60000,
  max: 100
});
```

**Q: 限流计数器什么时候重置？**
A: 限流计数器在每个时间窗口（windowMs）结束后自动重置。例如，如果设置 `windowMs: 60000`（1分钟），计数器每分钟重置一次。

**Q: 如何在前端处理 429 响应？**
A: 前端可以检查响应状态码和 `Retry-After` 头信息：
```javascript
fetch('/api/todos')
  .then(response => {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      console.log(`请求过于频繁，${retryAfter}秒后重试`);
      // 自动延迟重试
      setTimeout(() => {
        // 重新发送请求
      }, retryAfter * 1000);
    }
  });
```

## 参考资料
- [HTTP 429 状态码规范 (RFC 6585)](https://tools.ietf.org/html/rfc6585)
- [express-rate-limit 官方文档](https://github.com/nfriedly/express-rate-limit)
- [HTTP 状态码完整列表](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [API 限流最佳实践](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Rate Limiting 设计模式](https://docs.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern)

## 下一步学习
- 学习使用 Redis 实现分布式限流
- 了解滑动窗口限流算法
- 探索令牌桶和漏桶限流算法
- 学习使用 Nginx 进行限流
- 了解微服务架构中的限流策略
- 学习使用监控工具观察限流效果 