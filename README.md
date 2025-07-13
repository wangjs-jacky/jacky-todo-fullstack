# Jacky Todo Fullstack 应用

这是一个使用 Express.js 和 React 构建的全栈待办事项应用，用于学习前后端开发。

## 截图

![2025-07-13 22-26-16.2025-07-13 22_27_17](https://vblog-img.oss-cn-shanghai.aliyuncs.com/jacky-blog-vuepress/202507132228838.gif)

## 项目结构

```
jacky-todo-fullstack/
├── ✅ frontend/          # 前端项目 (Vite + React + Tailwind CSS)
│   ├── ✅ package.json
│   ├── ✅ index.html
│   ├── ✅ src/
│   │   ├── ✅ main.jsx
│   │   ├── ✅ App.jsx    # 主要的TODO组件
│   │   └── ✅ style.css
│   ├── ✅ vite.config.js
│   └── ✅ tailwind.config.js
├── ✅ backend/           # 后端项目 (Express 5 + TypeScript + Prisma)
│   ├── ✅ package.json
│   ├── ✅ src/
│   │   ├── ✅ server.ts
│   │   ├── ✅ routes/
│   │   │   ├── ✅ index.ts
│   │   │   └── ✅ todoRoutes.ts
│   │   ├── ✅ controller/
│   │   │   ├── ✅ TodoControllerPrisma.ts
│   │   │   ├── ✅ TodoController.ts
│   │   │   └── ✅ SystemController.ts
│   │   ├── ✅ middleware/
│   │   │   └── ✅ logger.ts
│   │   ├── ✅ lib/
│   │   │   ├── ✅ prisma.ts
│   │   │   ├── ✅ logger.ts
│   │   │   ├── ✅ errorHandler.ts
│   │   │   ├── ✅ AppError.ts
│   │   │   └── ✅ rateLimiters.ts
│   │   ├── ✅ interface.ts
│   │   └── ✅ types/
│   ├── ✅ prisma/
│   │   └── ✅ schema.prisma
│   ├── ✅ scripts/
│   │   ├── ✅ import-data.js
│   │   ├── ✅ test-prisma.js
│   │   └── ✅ test-rate-limit.js
│   ├── ✅ config/
│   ├── ✅ logs/
│   └── ✅ data.json
├── ✅ docs/              # 学习文档
│   ├── ✅ EXPRESS_TUTORIAL_PROMPT.md
│   ├── ✅ EXPRESS_QUICK_REFERENCE.md
│   ├── ✅ EXPRESS_ROUTER_ROUTE_GUIDE.md
│   ├── ✅ EXPRESS_LEARNING_PROGRESS.md
│   ├── ✅ PRISMA_GUIDE.md
│   ├── ✅ PRISMA_CRUD_GUIDE.md
│   ├── ✅ PINO_LOGGING_GUIDE.md
│   ├── ✅ PINO_IMPLEMENTATION_SUMMARY.md
│   ├── ✅ HTTP_429_RATE_LIMITING_GUIDE.md
│   └── ✅ CUSTOM_ERROR_HANDLING_GUIDE.md
└── ✅ README.md
```

## 前端部分

### 功能特性
- ✅ **增加** - 添加新的待办事项
- ✅ **删除** - 删除待办事项
- ✅ **修改** - 编辑待办事项内容
- ✅ **查询** - 显示所有待办事项列表
- ✅ 标记待办事项为已完成/未完成
- ✅ 统计信息显示
- ✅ 多种编辑方式（按钮点击、双击文本）

### 编辑功能说明
- ✅ **双击文本** - 快速进入编辑模式
- ✅ **编辑按钮** - 点击进入编辑模式
- ✅ **保存方式** - 点击保存按钮、按回车键、失去焦点
- ✅ **取消编辑** - 点击取消按钮、按ESC键

### 前端技术栈
- ✅ Vite - 构建工具
- ✅ React 18 - 前端框架
- ✅ Tailwind CSS - 样式框架
- ✅ PostCSS - CSS 处理器

### 运行前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000 查看应用

## 后端部分

后端使用 Express.js 5 + TypeScript + Prisma 实现，提供完整的 RESTful API 接口。

### 已实现功能
- ✅ GET /api/todos - 获取所有待办事项
- ✅ GET /api/todos/:id - 获取单个待办事项
- ✅ POST /api/todos - 创建新的待办事项
- ✅ PUT /api/todos/:id - 完整更新待办事项
- ✅ PATCH /api/todos/:id - 部分更新待办事项
- ✅ DELETE /api/todos/:id - 删除待办事项
- ✅ GET /health - 健康检查端点
- ✅ GET /welcome - 欢迎页面

### 高级功能
- ✅ **数据库集成** - 使用 Prisma ORM 连接 PostgreSQL
- ✅ **日志系统** - 使用 Pino 进行结构化日志记录
- ✅ **错误处理** - 自定义错误处理中间件
- ✅ **限流保护** - 分级限流配置（欢迎页面 100次/分钟，API 30次/分钟）
- ✅ **CORS 支持** - 跨域资源共享配置
- ✅ **TypeScript** - 完整的类型安全支持

### 后端技术栈
- ✅ Express.js 5 - Node.js Web 框架
- ✅ TypeScript - 类型安全的 JavaScript
- ✅ Prisma - 现代数据库 ORM
- ✅ PostgreSQL - 关系型数据库
- ✅ Pino - 高性能日志库
- ✅ Express Rate Limit - 限流中间件
- ✅ CORS - 跨域资源共享

### 运行后端

```bash
cd backend
npm install
npm run build
npm run dev
```

访问 http://localhost:3001 查看 API 服务

### 数据库操作

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 启动 Prisma Studio
npm run db:studio

# 导入测试数据
npm run seed
```

## 技术栈

### 前端
- React 18 - 用户界面框架
- Vite - 构建工具
- Tailwind CSS - 实用优先的 CSS 框架
- PostCSS - CSS 处理器

### 后端
- Express.js 5 - Node.js Web 框架
- TypeScript - 类型安全的 JavaScript
- Prisma - 现代数据库 ORM
- PostgreSQL - 关系型数据库
- Pino - 高性能日志库
- RESTful API - 数据接口设计

## 学习重点

1. ✅ Express 5 基础路由设置
2. ✅ RESTful API 设计
3. ✅ 前后端数据交互
4. ✅ React 基础组件开发
5. ✅ 状态管理（useState）
6. ✅ TypeScript 类型系统
7. ✅ Prisma ORM 使用
8. ✅ 日志记录和错误处理
9. ✅ 限流和安全性
10. ✅ 数据库设计和操作

## 开发说明

- 保持代码简洁，适合初学者学习
- 使用现代技术栈（Express 5、TypeScript、Prisma）
- 专注于基础概念教学
- 包含完整的错误处理和日志记录
- 提供详细的学习文档

## 文档

项目包含详细的学习文档，位于 `docs/` 目录：

- `EXPRESS_TUTORIAL_PROMPT.md` - Express 学习指南
- `EXPRESS_QUICK_REFERENCE.md` - Express 快速参考
- `EXPRESS_ROUTER_ROUTE_GUIDE.md` - Express 路由指南
- `PRISMA_GUIDE.md` - Prisma 使用指南
- `PINO_LOGGING_GUIDE.md` - 日志系统指南
- `HTTP_429_RATE_LIMITING_GUIDE.md` - 限流配置指南
- `CUSTOM_ERROR_HANDLING_GUIDE.md` - 错误处理指南 