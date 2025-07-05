# Express.js 学习进度表 📚

## 🎯 学习目标
- 掌握 Express.js 基础概念和核心功能
- 学会搭建完整的后端 API 服务
- 理解中间件、路由、错误处理等核心概念
- 能够独立开发 RESTful API

---

## 📋 学习进度记录

### ✅ 已完成

#### 1. 项目初始化与基础搭建
- [x] **项目结构创建**
  - 创建 `backend/` 目录
  - 初始化 `package.json`
  - 配置 ES6 模块 (`"type": "module"`)

- [x] **依赖安装**
  ```bash
  pnpm add express cors
  pnpm add -D nodemon
  ```

- [x] **开发环境配置**
  - 配置 `nodemon.json` 自动重启
  - 设置开发脚本：`pnpm run dev`
  - 配置调试模式：`pnpm run dev:debug`

#### 2. Express 服务器基础
- [x] **服务器创建**
  ```javascript
  import express from 'express';
  const app = express();
  const PORT = 3001;
  ```

- [x] **中间件配置**
  ```javascript
  app.use(cors());           // 跨域支持
  app.use(express.json());   // JSON 解析
  ```

- [x] **服务器启动**
  ```javascript
  app.listen(PORT, () => {
    console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  });
  ```

#### 3. API 路由开发
- [x] **GET 路由 - 获取数据**
  ```javascript
  app.get('/', async (req, res) => {
    // 读取 JSON 文件并返回数据
    const data = await fs.readFile('./data.json', 'utf8');
    const todos = JSON.parse(data);
    res.json({
      data: todos,
      count: todos.length,
      timestamp: new Date().toISOString()
    });
  });
  ```

- [x] **欢迎页面路由**
  ```javascript
  app.get('/welcome', (req, res) => {
    res.json({
      message: '欢迎使用 Express 5 后端服务器！',
      version: 'Express 5.1.0',
      status: 'success'
    });
  });
  ```

#### 4. 错误处理
- [x] **Express 5 错误处理中间件**
  ```javascript
  app.use((err, req, res, next) => {
    console.error('Express 5 错误处理:', err.stack);
    res.status(500).json({
      error: '服务器内部错误',
      message: err.message,
      version: 'Express 5'
    });
  });
  ```

#### 5. 前端集成
- [x] **Fetch API 集成**
  ```javascript
  const fetchTodos = async () => {
    const response = await fetch('http://localhost:3001/api/todos');
    const result = await response.json();
    setTodos(result.data || []);
  };
  ```

- [x] **错误处理和加载状态**
  - 添加 loading 状态管理
  - 实现错误提示和重试功能
  - 完整的错误边界处理

---

### ✅ 最新完成

#### 6. RESTful API 设计与实现
- [x] **API 路由重构**
  - 将混合式 API 改为标准 RESTful 风格
  - 使用正确的 HTTP 方法：GET、POST、PUT、PATCH、DELETE
  - 统一的资源路径：`/api/todos`

- [x] **完整的 CRUD API**
  ```javascript
  // 获取所有待办事项
  GET /api/todos
  
  // 获取单个待办事项
  GET /api/todos/:id
  
  // 创建待办事项
  POST /api/todos
  
  // 完整更新待办事项
  PUT /api/todos/:id
  
  // 部分更新待办事项
  PATCH /api/todos/:id
  
  // 删除待办事项
  DELETE /api/todos/:id
  ```

- [x] **PUT vs PATCH 区别实现**
  - **PUT**: 完整更新，需要提供所有字段
  - **PATCH**: 部分更新，只需提供要修改的字段
  - 前端使用 PATCH 进行状态切换和文本编辑

- [x] **数据持久化**
  - 文件系统操作 (`fs/promises`)
  - 数据验证和错误处理
  - 统一的响应格式

- [x] **前端 API 调用更新**
  - 更新所有 API 端点为 RESTful 风格
  - 使用 PATCH 方法进行部分更新
  - 完善的错误处理和用户反馈

#### 7. 错误处理与数据验证
- [x] **输入验证**
  - 待办事项内容不能为空
  - ID 参数验证
  - 请求体数据验证

- [x] **错误边界处理**
  - 404 错误：资源不存在
  - 400 错误：请求参数错误
  - 500 错误：服务器内部错误

- [x] **统一响应格式**
  ```javascript
  // 成功响应
  {
    "data": [...],
    "message": "操作成功",
    "timestamp": "2024-..."
  }
  
  // 错误响应
  {
    "error": "错误描述",
    "message": "详细错误信息"
  }
  ```

### 🔄 进行中

#### 8. 高级特性开发
- [ ] **中间件开发**
  - 自定义中间件
  - 中间件链
  - 错误处理中间件

- [ ] **路由模块化**
  - 路由分离
  - 模块化组织

- [ ] **参数处理**
  - 查询参数 (`req.query`)
  - 路径参数 (`req.params`)
  - 请求体 (`req.body`)

---

### 📝 待学习

#### 9. 数据库集成
- [ ] **SQLite 集成**
- [ ] **MongoDB 集成**
- [ ] **数据模型设计**

#### 10. 安全与性能
- [x] **CORS 配置**
- [ ] **输入验证增强**
- [ ] **速率限制**
- [ ] **日志记录**

---

## 🛠️ 常用脚本命令

### 开发环境
```bash
# 启动开发服务器（自动重启）
pnpm run dev

# 启动调试模式
pnpm run dev:debug

# 启动 Node.js watch 模式
pnpm run dev:watch

# 生产环境启动
pnpm start
```

### 调试命令
```bash
# 检查端口占用
lsof -i :3001

# 测试 API
curl http://localhost:3001/api/todos
curl http://localhost:3001/welcome

# 测试 CRUD 操作
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "测试待办事项", "completed": false}'

curl -X PATCH http://localhost:3001/api/todos/1234567890 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

curl -X DELETE http://localhost:3001/api/todos/1234567890

# 检查调试端口
lsof -i :9229
```

---

## 📚 学习资源

### 官方文档
- [Express.js 官方文档](https://expressjs.com/)
- [Express 5.x 新特性](https://expressjs.com/en/5x/api.html)

### 实践项目
- [x] TODO API 完整实现 (RESTful 风格)
- [ ] 用户管理系统
- [ ] 文件上传服务
- [ ] 实时聊天应用

---

## 🎯 下一步计划

1. **路由模块化** - 将路由分离到独立文件
2. **数据库集成** - 使用真实数据库替代 JSON 文件
3. **API 文档** - 使用 Swagger 生成 API 文档
4. **中间件开发** - 自定义中间件和中间件链
5. **性能优化** - 添加缓存和速率限制

---

## 📊 学习统计

- **当前进度**: RESTful API 完整实现 (70%)
- **掌握概念**: 服务器创建、基础路由、中间件、错误处理、CRUD 操作、RESTful API 设计
- **待掌握**: 路由模块化、数据库集成、高级特性、性能优化