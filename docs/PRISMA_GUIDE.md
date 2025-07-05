# Prisma 数据库工具入门指南

## 概述
Prisma 是一个现代化的数据库工具包，它就像一个"翻译官"，帮助开发者用简单的 JavaScript 代码来操作复杂的数据库。对于前端开发者来说，它让数据库操作变得像操作 JavaScript 对象一样简单。

## 工具对比
- **Prisma**: 现代化选择，类型安全，开发体验好，适合 TypeScript 项目
- **Sequelize**: 传统 ORM，功能全面，但配置复杂
- **TypeORM**: 功能强大，但学习曲线陡峭
- **原生 SQL**: 性能最好，但开发效率低，容易出错

## 前置条件
- 已安装 Node.js（版本 14.0 或以上）
- 有一个 Node.js 项目
- 了解基本的 JavaScript/TypeScript 语法

## 详细步骤

### 方案一：快速开始（推荐新手）

#### 步骤 1: 安装 Prisma
1. 打开终端，进入项目目录
2. 执行安装命令：
   ```bash
   npm install prisma --save-dev
   npm install @prisma/client
   ```
3. 预期结果：看到 `prisma` 和 `@prisma/client` 出现在 `package.json` 中

#### 步骤 2: 初始化 Prisma
1. 执行初始化命令：
   ```bash
   npx prisma init
   ```
2. 预期结果：
   - 创建 `prisma` 文件夹
   - 生成 `schema.prisma` 文件
   - 创建 `.env` 文件
   - 更新 `.gitignore`

#### 步骤 3: 配置数据库连接
1. 打开 `.env` 文件
2. 修改数据库连接字符串：
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"
   ```
3. 支持的数据库：
   - PostgreSQL: `postgresql://...`
   - MySQL: `mysql://...`
   - SQLite: `file:./dev.db`

#### 步骤 4: 定义数据模型
1. 打开 `prisma/schema.prisma` 文件
2. 添加数据模型：
   ```prisma
   model User {
     id        Int      @id @default(autoincrement())
     email     String   @unique
     name      String?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

#### 步骤 5: 生成客户端代码
1. 执行生成命令：
   ```bash
   npx prisma generate
   ```
2. 预期结果：在 `node_modules/.prisma/client/` 中生成客户端代码

#### 步骤 6: 创建数据库表
1. 执行迁移命令：
   ```bash
   npx prisma migrate dev --name init
   ```
2. 预期结果：
   - 创建 `prisma/migrations` 文件夹
   - 生成 SQL 迁移文件
   - 在数据库中创建表

#### 步骤 7: 在代码中使用
1. 在项目文件中导入 Prisma：
   ```javascript
   import { PrismaClient } from '@prisma/client'
   
   const prisma = new PrismaClient()
   ```

2. 使用 Prisma 操作数据：
   ```javascript
   // 创建用户
   const user = await prisma.user.create({
     data: {
       email: 'user@example.com',
       name: 'John Doe'
     }
   })
   
   // 查询用户
   const users = await prisma.user.findMany()
   
   // 更新用户
   const updatedUser = await prisma.user.update({
     where: { id: 1 },
     data: { name: 'Jane Doe' }
   })
   
   // 删除用户
   await prisma.user.delete({
     where: { id: 1 }
   })
   ```

### 方案二：生产环境配置

#### 步骤 1: 配置 package.json 脚本
1. 打开 `package.json` 文件
2. 添加 Prisma 相关脚本：
   ```json
   {
     "scripts": {
       "build": "npx prisma generate && npm run build:app",
       "db:generate": "prisma generate",
       "db:migrate": "prisma migrate deploy",
       "db:studio": "prisma studio"
     }
   }
   ```

#### 步骤 2: 生产环境部署流程
1. 构建阶段：
   ```bash
   npm install
   npm run build
   ```

2. 部署阶段：
   ```bash
   npm run db:migrate
   npm start
   ```

## 核心概念详解

### 1. Schema 语法
```prisma
// 数据源配置
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 生成器配置
generator client {
  provider = "prisma-client-js"
}

// 数据模型
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // 关系
  posts     Post[]
  
  // 表名映射
  @@map("users")
}
```

### 2. 常用字段类型
- **Int**: 整数
- **String**: 字符串
- **Boolean**: 布尔值
- **DateTime**: 日期时间
- **Float**: 浮点数
- **Decimal**: 精确小数

### 3. 常用指令
- **@id**: 主键
- **@default()**: 默认值
- **@unique**: 唯一约束
- **@map()**: 字段映射
- **@ignore**: 忽略字段
- **@updatedAt**: 自动更新时间

### 4. ID 生成方式
```prisma
model Example {
  // 自增 ID（传统方式）
  id1 Int @id @default(autoincrement())
  
  // UUID（全局唯一）
  id2 String @id @default(uuid())
  
  // CUID（推荐 Web 应用）
  id3 String @id @default(cuid())
}
```

## 验证方法
1. 启动 Prisma Studio：`npx prisma studio`
2. 在浏览器中查看数据库内容
3. 测试基本的 CRUD 操作
4. 检查生成的 TypeScript 类型

## 常见问题
**Q: 什么时候需要执行 `npx prisma generate`？**
A: 在修改 schema.prisma 文件后，或者在部署到生产环境前。这个命令生成客户端代码，不是 SQL 语句。

**Q: 迁移（migrate）是必须的吗？**
A: 不是必须的，但强烈推荐。迁移提供版本控制和团队协作支持。对于简单项目，可以使用 `npx prisma db push`。

**Q: 什么时候需要 createdAt 和 updatedAt？**
A: 需要审计功能、排序功能或缓存策略时添加。核心业务数据和用户生成内容建议添加，静态配置数据通常不需要。

**Q: 表名映射有什么用？**
A: 让 Prisma 模型名和数据库表名可以不同，用于遵循不同的命名规范或避免关键字冲突。

**Q: UUID 和 CUID 有什么区别？**
A: UUID 是传统标准，适合企业级应用；CUID 是现代化选择，更短、有序、URL 安全，适合 Web 应用。

## 参考资料
- [Prisma 官方文档](https://www.prisma.io/docs)
- [Prisma Schema 参考](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API 参考](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma 最佳实践](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Prisma 社区](https://community.prisma.io)

## 下一步学习
- 学习 Prisma 关系查询和嵌套操作
- 了解 Prisma 的性能优化技巧
- 学习使用 Prisma Studio 进行数据管理
- 探索 Prisma 的高级功能（如事务、原生查询）
- 学习 Prisma 与不同数据库的集成
- 了解 Prisma 在微服务架构中的应用 