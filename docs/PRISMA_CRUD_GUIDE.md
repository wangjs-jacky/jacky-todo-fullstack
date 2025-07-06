# Prisma CRUD 操作指南

## 概述

本文档基于 `jacky-todo-fullstack` 项目，介绍如何使用 Prisma 进行数据库的 CRUD（创建、读取、更新、删除）操作。

## 数据库模型

### Todo 模型

```prisma
model Todo {
  id        Int     @id @map("id")
  text      String  @map("text")
  completed Boolean @map("completed")

  @@map("todo")
}
```

**字段说明：**
- `id`: 主键，整数类型
- `text`: 待办事项内容，字符串类型
- `completed`: 完成状态，布尔类型
- `@@map("todo")`: 数据库表名映射为 "todo"

## CRUD 操作详解

### 1. 创建 (Create)

#### 创建单个待办事项

```typescript
// 创建待办事项
export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, completed = false }: CreateTodoRequest = req.body;
    
    // 验证输入
    if (!text || text.trim() === '') {
      res.status(400).json({ error: '待办事项内容不能为空' });
      return;
    }

    // 使用 Prisma 创建记录
    const newTodo = await prisma.todo.create({
      data: {
        id: Date.now(), // 使用时间戳作为 ID
        text: text.trim(),
        completed
      }
    });

    res.status(201).json({
      message: '待办事项创建成功',
      data: newTodo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 错误处理
    res.status(500).json({
      error: '创建待办事项失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
};
```

**请求示例：**
```bash
POST /api/todos
Content-Type: application/json

{
  "text": "学习 Prisma",
  "completed": false
}
```

### 2. 读取 (Read)

#### 获取所有待办事项

```typescript
// 获取所有待办事项
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        id: 'asc' // 按 ID 升序排列
      }
    });

    res.status(200).json({
      data: todos,
      count: todos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: '读取数据失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
};
```

#### 根据 ID 获取单个待办事项

```typescript
// 获取单个待办事项
export const getTodoById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 验证参数
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数' });
      return;
    }

    // 使用 Prisma 查找记录
    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id, 10) }
    });

    // 检查记录是否存在
    if (!todo) {
      res.status(404).json({ error: '待办事项不存在' });
      return;
    }

    res.status(200).json({ data: todo, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({
      error: '获取待办事项失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
};
```

**请求示例：**
```bash
GET /api/todos          # 获取所有待办事项
GET /api/todos/123      # 获取 ID 为 123 的待办事项
```

### 3. 更新 (Update)

#### 完整更新 (PUT)

```typescript
// 完整更新待办事项
export const updateTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, completed }: UpdateTodoRequest = req.body;
    
    // 验证必需字段
    if (text === undefined || completed === undefined) {
      res.status(400).json({
        error: 'PUT 请求需要提供完整的资源数据（text 和 completed）'
      });
      return;
    }

    // 使用 Prisma 更新记录
    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(id, 10) },
      data: {
        text: text.trim(),
        completed
      }
    });

    res.status(200).json({
      message: '待办事项完整更新成功',
      data: updatedTodo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 处理记录不存在的情况
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ error: '待办事项不存在' });
      return;
    }
    res.status(500).json({
      error: '更新待办事项失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
};
```

#### 部分更新 (PATCH)

```typescript
// 部分更新待办事项
export const patchTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, completed }: UpdateTodoRequest = req.body;
    const updateData: any = {};

    // 只更新提供的字段
    if (text !== undefined) {
      updateData.text = text.trim();
    }
    if (completed !== undefined) {
      updateData.completed = completed;
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });

    res.status(200).json({
      message: '待办事项部分更新成功',
      data: updatedTodo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ error: '待办事项不存在' });
      return;
    }
    res.status(500).json({
      error: '更新待办事项失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
};
```

**请求示例：**
```bash
# 完整更新
PUT /api/todos/123
Content-Type: application/json

{
  "text": "更新后的待办事项",
  "completed": true
}

# 部分更新
PATCH /api/todos/123
Content-Type: application/json

{
  "completed": true
}
```

### 4. 删除 (Delete)

```typescript
// 删除待办事项
export const deleteTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 验证参数
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数' });
      return;
    }

    // 使用 Prisma 删除记录
    const deletedTodo = await prisma.todo.delete({
      where: { id: parseInt(id, 10) }
    });

    res.status(200).json({
      message: '待办事项删除成功',
      data: deletedTodo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 处理记录不存在的情况
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      res.status(404).json({ error: '待办事项不存在' });
      return;
    }
    res.status(500).json({
      error: '删除待办事项失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
};
```

**请求示例：**
```bash
DELETE /api/todos/123
```

## 常用 Prisma 查询方法

### 基础查询

```typescript
// 查找所有记录
const allTodos = await prisma.todo.findMany();

// 查找单个记录
const todo = await prisma.todo.findUnique({
  where: { id: 123 }
});

// 查找第一个匹配的记录
const firstTodo = await prisma.todo.findFirst({
  where: { completed: true }
});
```

### 条件查询

```typescript
// 条件查询
const completedTodos = await prisma.todo.findMany({
  where: {
    completed: true
  }
});

// 复杂条件查询
const filteredTodos = await prisma.todo.findMany({
  where: {
    AND: [
      { completed: false },
      { text: { contains: '学习' } }
    ]
  }
});
```

### 排序和分页

```typescript
// 排序
const sortedTodos = await prisma.todo.findMany({
  orderBy: [
    { id: 'asc' },
    { text: 'desc' }
  ]
});

// 分页
const paginatedTodos = await prisma.todo.findMany({
  skip: 10,  // 跳过前 10 条
  take: 5    // 取 5 条
});
```

### 选择字段

```typescript
// 只选择特定字段
const todoIds = await prisma.todo.findMany({
  select: {
    id: true,
    text: true
  }
});
```

## 错误处理最佳实践

1. **参数验证**：在数据库操作前验证输入参数
2. **记录存在性检查**：使用 `findUnique` 检查记录是否存在
3. **异常捕获**：使用 try-catch 捕获 Prisma 异常
4. **错误分类**：区分不同类型的错误（404、400、500）
5. **用户友好消息**：提供清晰的错误信息

## 类型安全

项目使用 TypeScript 接口确保类型安全：

```typescript
// 基础 Todo 接口
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 创建请求接口
export interface CreateTodoRequest {
  text: string;
  completed?: boolean;
}

// 更新请求接口
export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
}
```
