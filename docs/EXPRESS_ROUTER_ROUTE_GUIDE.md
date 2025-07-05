# Express.js 路由模块化开发指南

## 概述
Express.js 是 Node.js 最流行的 Web 框架，路由模块化是大型项目开发中的重要概念。通过合理的路由组织，可以让代码更清晰、更易维护，就像把一个大房子分成多个房间一样，每个房间负责不同的功能。

## 工具对比
- **app.use 全局注册**: 简单直接，适合小型项目，但扩展性有限
- **router.use 模块化**: 结构清晰，易于扩展，适合中大型项目
- **router.route 链式调用**: 代码简洁，适合同一路径的多个 HTTP 方法

## 前置条件
- 已安装 Node.js（版本 14.0 或以上）
- 已安装 Express.js：`npm install express`
- 了解基本的 JavaScript 语法
- 有一个 Express.js 项目

## 详细步骤

### 方案一：使用 app.use 全局注册（适合小型项目）

#### 步骤 1: 创建路由文件
1. 在 `src/routes` 目录下创建 `todoRoutes.ts`：
   ```typescript
   import { Router } from 'express';
   
   const router = Router();
   
   // 获取所有待办事项
   router.get('/', (req, res) => {
     res.json({ message: '获取所有待办事项' });
   });
   
   // 创建新待办事项
   router.post('/', (req, res) => {
     res.json({ message: '创建新待办事项' });
   });
   
   export default router;
   ```

#### 步骤 2: 在主文件中注册路由
1. 在 `server.ts` 中直接注册：
   ```typescript
   import express from 'express';
   import todoRoutes from './routes/todoRoutes';
   
   const app = express();
   
   // 全局中间件
   app.use(express.json());
   app.use(cors());
   
   // 直接注册路由
   app.use('/api/todos', todoRoutes);
   
   app.listen(3000, () => {
     console.log('服务器运行在端口 3000');
   });
   ```

#### 步骤 3: 添加更多路由模块
1. 创建 `userRoutes.ts`：
   ```typescript
   import { Router } from 'express';
   
   const router = Router();
   
   router.get('/', (req, res) => {
     res.json({ message: '获取所有用户' });
   });
   
   export default router;
   ```

2. 在 `server.ts` 中继续注册：
   ```typescript
   import userRoutes from './routes/userRoutes';
   
   // 注册用户路由
   app.use('/api/users', userRoutes);
   ```

### 方案二：使用 router.use 模块化（推荐中大型项目）

#### 步骤 1: 创建主路由文件
1. 创建 `src/routes/index.ts`：
   ```typescript
   import { Router } from 'express';
   import todoRoutes from './todoRoutes';
   import userRoutes from './userRoutes';
   
   const router = Router();
   
   // 注册所有路由模块
   router.use('/todos', todoRoutes);
   router.use('/users', userRoutes);
   
   export default router;
   ```

#### 步骤 2: 在主文件中注册主路由
1. 在 `server.ts` 中注册主路由：
   ```typescript
   import express from 'express';
   import routes from './routes';
   
   const app = express();
   
   // 全局中间件
   app.use(express.json());
   app.use(cors());
   
   // 注册主路由
   app.use('/api', routes);
   
   app.listen(3000, () => {
     console.log('服务器运行在端口 3000');
   });
   ```

#### 步骤 3: 添加新模块
1. 创建 `authRoutes.ts`：
   ```typescript
   import { Router } from 'express';
   
   const router = Router();
   
   router.post('/login', (req, res) => {
     res.json({ message: '用户登录' });
   });
   
   router.post('/register', (req, res) => {
     res.json({ message: '用户注册' });
   });
   
   export default router;
   ```

2. 在 `routes/index.ts` 中添加：
   ```typescript
   import authRoutes from './authRoutes';
   
   // 添加认证路由
   router.use('/auth', authRoutes);
   ```

### 方案三：使用 router.route 链式调用（推荐同一路径多方法）

#### 步骤 1: 使用 router.route 简化代码
1. 在 `todoRoutes.ts` 中使用 `router.route`：
   ```typescript
   import { Router } from 'express';
   
   const router = Router();
   
   // 传统方式 - 需要重复路径
   // router.get('/todos', getTodos);
   // router.post('/todos', createTodo);
   // router.put('/todos/:id', updateTodo);
   // router.delete('/todos/:id', deleteTodo);
   
   // 使用 router.route 链式调用 - 更简洁
   router.route('/')
     .get((req, res) => {
       res.json({ message: '获取所有待办事项' });
     })
     .post((req, res) => {
       res.json({ message: '创建新待办事项' });
     });
   
   router.route('/:id')
     .get((req, res) => {
       res.json({ message: `获取待办事项 ${req.params.id}` });
     })
     .put((req, res) => {
       res.json({ message: `更新待办事项 ${req.params.id}` });
     })
     .delete((req, res) => {
       res.json({ message: `删除待办事项 ${req.params.id}` });
     });
   
   export default router;
   ```

#### 步骤 2: 结合控制器使用 router.route
1. 创建控制器文件 `TodoController.ts`：
   ```typescript
   export class TodoController {
     // 获取所有待办事项
     static async getAllTodos(req: any, res: any) {
       res.json({ message: '获取所有待办事项' });
     }
   
     // 创建新待办事项
     static async createTodo(req: any, res: any) {
       res.json({ message: '创建新待办事项' });
     }
   
     // 获取单个待办事项
     static async getTodoById(req: any, res: any) {
       res.json({ message: `获取待办事项 ${req.params.id}` });
     }
   
     // 更新待办事项
     static async updateTodo(req: any, res: any) {
       res.json({ message: `更新待办事项 ${req.params.id}` });
     }
   
     // 删除待办事项
     static async deleteTodo(req: any, res: any) {
       res.json({ message: `删除待办事项 ${req.params.id}` });
     }
   }
   ```

2. 在路由中使用控制器：
   ```typescript
   import { Router } from 'express';
   import { TodoController } from '../controller/TodoController';
   
   const router = Router();
   
   // 使用 router.route 结合控制器
   router.route('/')
     .get(TodoController.getAllTodos)
     .post(TodoController.createTodo);
   
   router.route('/:id')
     .get(TodoController.getTodoById)
     .put(TodoController.updateTodo)
     .delete(TodoController.deleteTodo);
   
   export default router;
   ```

#### 步骤 3: 添加中间件到 router.route
1. 创建中间件文件 `middleware.ts`：
   ```typescript
   export const validateTodo = (req: any, res: any, next: any) => {
     if (!req.body.title) {
       return res.status(400).json({ error: '标题是必需的' });
     }
     next();
   };
   
   export const authMiddleware = (req: any, res: any, next: any) => {
     // 验证用户身份的逻辑
     console.log('验证用户身份');
     next();
   };
   ```

2. 在路由中使用中间件：
   ```typescript
   import { Router } from 'express';
   import { TodoController } from '../controller/TodoController';
   import { validateTodo, authMiddleware } from '../middleware';
   
   const router = Router();
   
   // 为特定路径添加中间件
   router.route('/')
     .get(authMiddleware, TodoController.getAllTodos)
     .post(authMiddleware, validateTodo, TodoController.createTodo);
   
   router.route('/:id')
     .get(authMiddleware, TodoController.getTodoById)
     .put(authMiddleware, validateTodo, TodoController.updateTodo)
     .delete(authMiddleware, TodoController.deleteTodo);
   
   export default router;
   ```

## 三种方式的详细对比

| 特性 | app.use 全局注册 | router.use 模块化 | router.route 链式调用 |
|------|------------------|-------------------|----------------------|
| **代码组织** | 路由注册分散在 server.ts | 路由注册集中在 routes/index.ts | 同一路径的方法集中管理 |
| **路径管理** | 每个路由都需要写完整路径 | 路径前缀统一管理 | 路径只需写一次 |
| **扩展性** | 随着模块增多，server.ts 会变长 | 易于添加新模块 | 易于添加同一路径的新方法 |
| **维护性** | 修改 API 前缀需要改多个地方 | 修改前缀只需改一个地方 | 修改路径只需改一个地方 |
| **代码简洁性** | 中等 | 中等 | 高（减少重复路径） |
| **适用场景** | 小型项目 | 中大型项目 | 同一路径多 HTTP 方法 |
| **测试** | 需要启动整个应用 | 可以独立测试路由模块 | 可以独立测试路由模块 |

## router.route 的优势和最佳实践

### 优势
1. **减少代码重复**: 同一路径的多个 HTTP 方法只需写一次路径
2. **提高可读性**: 相关的方法集中在一起，逻辑更清晰
3. **易于维护**: 修改路径时只需改一个地方
4. **支持链式调用**: 可以连续调用多个方法

### 最佳实践
1. **按功能分组**: 将相关的 HTTP 方法放在同一个 `router.route` 中
2. **使用控制器**: 将业务逻辑分离到控制器中
3. **合理使用中间件**: 为不同的方法添加适当的中间件
4. **保持一致性**: 在整个项目中统一使用相同的模式

### 示例：完整的 RESTful API
```typescript
import { Router } from 'express';
import { TodoController } from '../controller/TodoController';
import { validateTodo, authMiddleware } from '../middleware';

const router = Router();

// 集合路由 - 处理 /todos
router.route('/')
  .get(authMiddleware, TodoController.getAllTodos)
  .post(authMiddleware, validateTodo, TodoController.createTodo);

// 单个资源路由 - 处理 /todos/:id
router.route('/:id')
  .get(authMiddleware, TodoController.getTodoById)
  .put(authMiddleware, validateTodo, TodoController.updateTodo)
  .patch(authMiddleware, validateTodo, TodoController.partialUpdateTodo)
  .delete(authMiddleware, TodoController.deleteTodo);

// 嵌套资源路由 - 处理 /todos/:id/comments
router.route('/:id/comments')
  .get(authMiddleware, TodoController.getTodoComments)
  .post(authMiddleware, validateComment, TodoController.addTodoComment);

export default router;
```

## 项目目录结构示例

```
backend/
├── src/
│   ├── routes/
│   │   ├── index.ts          # 主路由文件
│   │   ├── todoRoutes.ts     # 待办事项路由（使用 router.route）
│   │   ├── userRoutes.ts     # 用户路由
│   │   └── authRoutes.ts     # 认证路由
│   ├── controller/
│   │   ├── TodoController.ts
│   │   └── UserController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── validation.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

## 验证方法
1. 启动服务器：`npm run dev`
2. 测试路由：
   ```bash
   # 测试待办事项路由
   curl http://localhost:3000/api/todos
   curl -X POST http://localhost:3000/api/todos -H "Content-Type: application/json" -d '{"title":"测试"}'
   curl http://localhost:3000/api/todos/1
   curl -X PUT http://localhost:3000/api/todos/1 -H "Content-Type: application/json" -d '{"title":"更新"}'
   curl -X DELETE http://localhost:3000/api/todos/1
   
   # 测试用户路由
   curl http://localhost:3000/api/users
   
   # 测试认证路由
   curl -X POST http://localhost:3000/api/auth/login
   ```
3. 检查响应是否正确

## 常见问题

**Q: router.use 和 app.use 有什么区别？**
A: 
- `app.use` 在 Express 应用实例上使用，影响整个应用程序
- `router.use` 在 Express Router 实例上使用，只影响该路由器的特定路径
- `app.use` 通常用于全局中间件，`router.use` 用于模块化路由组织

**Q: router.route 和传统的路由定义有什么区别？**
A:
- 传统方式：每个 HTTP 方法都需要重复写路径
- `router.route`：同一路径的多个 HTTP 方法可以链式调用，路径只需写一次
- `router.route` 更适合 RESTful API 设计

**Q: 什么时候使用 router.route？**
A:
- 当同一路径需要处理多个 HTTP 方法时（GET、POST、PUT、DELETE 等）
- 想要减少代码重复，提高可读性时
- 构建 RESTful API 时

**Q: router.route 可以嵌套使用吗？**
A: 是的，可以在 `router.route` 的回调函数中继续使用 `router.route`，但通常不推荐，因为会使代码变得复杂。

**Q: 如何选择适合自己项目的路由组织方式？**
A:
- **小型项目**（< 5 个路由模块）：使用 app.use 全局注册
- **中型项目**（5-15 个路由模块）：使用 router.use 模块化
- **大型项目**（> 15 个路由模块）：使用 router.use + 按功能分组
- **RESTful API**：推荐使用 router.route 链式调用

## 最佳实践

### 1. 路由命名规范
```typescript
// 好的命名
router.route('/todos')
  .get(getTodos)
  .post(createTodo);

router.route('/todos/:id')
  .get(getTodoById)
  .put(updateTodo)
  .delete(deleteTodo);

// 避免的命名
router.route('/getTodos')
  .get(getTodos)
  .post(createTodo);
```

### 2. 中间件使用
```typescript
// 在路由级别使用中间件
router.use('/todos', authMiddleware, todoRoutes);

// 在具体路由使用中间件
router.route('/todos')
  .get(authMiddleware, getTodos)
  .post(authMiddleware, validateTodo, createTodo);
```

### 3. 错误处理
```typescript
// 在路由模块中添加错误处理
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});
```

### 4. 控制器分离
```typescript
// 推荐：将业务逻辑分离到控制器
router.route('/todos')
  .get(TodoController.getAllTodos)
  .post(TodoController.createTodo);

// 避免：在路由中直接写业务逻辑
router.route('/todos')
  .get((req, res) => {
    // 复杂的业务逻辑
  })
  .post((req, res) => {
    // 复杂的业务逻辑
  });
```

## Express 中间件链机制详解

### 什么是中间件链？
在 Express 中，路由处理可以接受多个函数，它们会按照顺序执行，形成"处理链"：

```typescript
router.get('/path', middleware1, middleware2, ..., finalHandler);
```

每个函数都有 `(req, res, next)` 参数，前一个函数调用 `next()` 才会执行下一个，最后一个函数通常发送响应（不调用 `next()`）。

### 中间件链的执行流程

#### 基本流程
```typescript
// 中间件链示例
router.get('/todos', 
  authMiddleware,      // 1. 验证用户身份
  validateQuery,       // 2. 验证查询参数
  TodoController.getAllTodos  // 3. 处理业务逻辑并发送响应
);
```

#### 详细执行步骤
1. **第一个中间件** (`authMiddleware`) 执行
   - 如果验证失败，调用 `res.status(401).json({error: '未授权'})`
   - 如果验证成功，调用 `next()` 继续执行

2. **第二个中间件** (`validateQuery`) 执行
   - 如果验证失败，调用 `res.status(400).json({error: '参数错误'})`
   - 如果验证成功，调用 `next()` 继续执行

3. **最终处理器** (`TodoController.getAllTodos`) 执行
   - 处理业务逻辑
   - 调用 `res.json()` 发送响应（不调用 `next()`）

### 中间件链的实际应用

#### 示例 1: 用户认证和权限检查
```typescript
import { Router } from 'express';
import { TodoController } from '../controller/TodoController';

const router = Router();

// 中间件函数
const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: '缺少认证令牌' });
  }
  // 验证令牌逻辑...
  req.user = { id: 1, name: '张三' }; // 将用户信息添加到请求对象
  next();
};

const checkPermission = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' });
  }
  next();
};

const validateTodoData = (req: any, res: any, next: any) => {
  const { title, description } = req.body;
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: '标题不能为空' });
  }
  if (description && description.length > 500) {
    return res.status(400).json({ error: '描述不能超过500字符' });
  }
  next();
};

// 使用中间件链
router.route('/todos')
  .get(authMiddleware, TodoController.getAllTodos)
  .post(authMiddleware, validateTodoData, TodoController.createTodo);

router.route('/todos/:id')
  .put(authMiddleware, checkPermission, validateTodoData, TodoController.updateTodo)
  .delete(authMiddleware, checkPermission, TodoController.deleteTodo);

export default router;
```

#### 示例 2: 日志记录和性能监控
```typescript
// 日志中间件
const logRequest = (req: any, res: any, next: any) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  req.startTime = Date.now();
  next();
};

// 性能监控中间件
const performanceMonitor = (req: any, res: any, next: any) => {
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
};

// 错误处理中间件
const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
};

// 在路由中使用
router.use(logRequest);
router.use(performanceMonitor);

router.route('/todos')
  .get(authMiddleware, TodoController.getAllTodos)
  .post(authMiddleware, validateTodoData, TodoController.createTodo);

// 错误处理中间件放在最后
router.use(errorHandler);
```

#### 示例 3: 数据验证和清理
```typescript
// 数据清理中间件
const sanitizeInput = (req: any, res: any, next: any) => {
  // 清理请求体数据
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  // 清理查询参数
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

// 分页参数验证
const validatePagination = (req: any, res: any, next: any) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ error: '分页参数无效' });
  }
  
  req.pagination = { page, limit, skip: (page - 1) * limit };
  next();
};

// 在路由中使用
router.route('/todos')
  .get(authMiddleware, sanitizeInput, validatePagination, TodoController.getAllTodos)
  .post(authMiddleware, sanitizeInput, validateTodoData, TodoController.createTodo);
```

### 中间件链的最佳实践

#### 1. 中间件顺序很重要
```typescript
// 正确的顺序
router.use(express.json());           // 1. 解析 JSON
router.use(cors());                   // 2. 处理跨域
router.use(logRequest);               // 3. 记录请求
router.use(authMiddleware);           // 4. 身份验证
router.use('/todos', todoRoutes);     // 5. 业务路由

// 错误的顺序 - 身份验证在 JSON 解析之前
router.use(authMiddleware);           // 无法访问 req.body
router.use(express.json());
```

#### 2. 错误处理中间件放在最后
```typescript
// 错误处理中间件必须放在所有路由之后
router.use('/todos', todoRoutes);
router.use('/users', userRoutes);

// 错误处理中间件
router.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});
```

#### 3. 条件中间件
```typescript
// 根据条件决定是否执行中间件
const conditionalAuth = (req: any, res: any, next: any) => {
  // 某些路径不需要认证
  if (req.path === '/public' || req.method === 'GET') {
    return next();
  }
  
  // 其他路径需要认证
  authMiddleware(req, res, next);
};

router.use(conditionalAuth);
```

#### 4. 异步中间件处理
```typescript
// 异步中间件需要正确处理错误
const asyncMiddleware = async (req: any, res: any, next: any) => {
  try {
    // 异步操作
    const user = await User.findById(req.userId);
    req.user = user;
    next();
  } catch (error) {
    next(error); // 将错误传递给错误处理中间件
  }
};

// 或者使用包装函数
const wrapAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

router.get('/todos', wrapAsync(async (req: any, res: any) => {
  const todos = await Todo.find();
  res.json(todos);
}));
```

### 中间件链的调试技巧

#### 1. 添加调试日志
```typescript
const debugMiddleware = (name: string) => {
  return (req: any, res: any, next: any) => {
    console.log(`进入中间件: ${name}`);
    next();
    console.log(`离开中间件: ${name}`);
  };
};

router.get('/todos',
  debugMiddleware('认证'),
  authMiddleware,
  debugMiddleware('验证'),
  validateTodoData,
  debugMiddleware('控制器'),
  TodoController.getAllTodos
);
```

#### 2. 使用 Express 调试模式
```bash
# 启动时启用调试
DEBUG=express:* node server.js
```

### 常见问题和解决方案

**Q: 中间件没有按预期执行？**
A: 检查是否调用了 `next()`，或者是否在某个中间件中发送了响应但没有调用 `next()`。

**Q: 如何跳过某些中间件？**
A: 使用条件逻辑在中间件内部决定是否调用 `next()`。

**Q: 异步中间件出错怎么办？**
A: 使用 try-catch 包装异步代码，并在 catch 中调用 `next(error)`。

**Q: 中间件可以修改请求对象吗？**
A: 可以，修改 `req` 对象会影响后续的中间件和路由处理器。

## 参考资料
- [Express.js 官方文档](https://expressjs.com/)
- [Express Router 文档](https://expressjs.com/en/4x/api.html#router)
- [Express Route 文档](https://expressjs.com/en/4x/api.html#router.route)
- [Express 中间件文档](https://expressjs.com/en/guide/using-middleware.html)
- [Node.js 官方文档](https://nodejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Express.js 最佳实践](https://expressjs.com/en/advanced/best-practices-performance.html)

## 下一步学习
- 学习 Express.js 中间件开发
- 了解 RESTful API 设计原则
- 学习使用 TypeScript 进行类型安全的开发
- 探索 Express.js 的错误处理机制
- 学习使用 Express.js 进行数据库集成
- 了解 Express.js 的安全最佳实践
- 学习 Express.js 的测试策略
- 探索 Express.js 的性能优化技巧