import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest} from './interface';

// 加载环境变量
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);
const DATA_FILE: string = process.env.DATA_FILE_PATH || './data.json';

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001'
}));
app.use(express.json());

// 【查】获取所有待办事项 - GET /api/todos
app.get('/api/todos', async (req: Request, res: Response) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const todos: Todo[] = JSON.parse(data);
    res.status(200).json({
      data: todos,
      count: todos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('读取 data.json 失败:', error);
    res.status(500).json({
      error: '读取数据失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
});

// 【查】获取单个待办事项 - GET /api/todos/:id
app.get('/api/todos/:id', (async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
    }
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const todos: Todo[] = JSON.parse(data);
    const todo = todos.find(todo => todo.id === parseInt(id, 10));
    if (!todo) {
      return res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
    }
    res.status(200).json({ data: todo, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('获取待办事项失败:', error);
    res.status(500).json({ error: '获取待办事项失败', message: error instanceof Error ? error.message : '未知错误', timestamp: new Date().toISOString() });
  }
}) as any);

// 【增】创建待办事项 - POST /api/todos
app.post('/api/todos', (async (req: Request, res: Response) => {
  try {
    const { text, completed = false }: CreateTodoRequest = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: '待办事项内容不能为空', timestamp: new Date().toISOString() });
    }
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const todos: Todo[] = JSON.parse(data);
    const newTodo: Todo = { id: Date.now(), text: text.trim(), completed };
    todos.push(newTodo);
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
    res.status(201).json({ message: '待办事项创建成功', data: newTodo, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('创建待办事项失败:', error);
    res.status(500).json({ error: '创建待办事项失败', message: error instanceof Error ? error.message : '未知错误', timestamp: new Date().toISOString() });
  }
}) as any);

// 【改】完整更新待办事项 - PUT /api/todos/:id
app.put('/api/todos/:id', (async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
    }
    const { text, completed }: UpdateTodoRequest = req.body;
    if (text === undefined || completed === undefined) {
      return res.status(400).json({ error: 'PUT 请求需要提供完整的资源数据（text 和 completed）', timestamp: new Date().toISOString() });
    }
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const todos: Todo[] = JSON.parse(data);
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(id, 10));
    if (todoIndex === -1) {
      return res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
    }
    todos[todoIndex] = { id: parseInt(id, 10), text: text.trim(), completed };
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
    res.status(200).json({ message: '待办事项完整更新成功', data: todos[todoIndex], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('更新待办事项失败:', error);
    res.status(500).json({ error: '更新待办事项失败', message: error instanceof Error ? error.message : '未知错误', timestamp: new Date().toISOString() });
  }
}) as any);

// 【改】部分更新待办事项 - PATCH /api/todos/:id
app.patch('/api/todos/:id', (async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
    }
    const { text, completed }: UpdateTodoRequest = req.body;
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const todos: Todo[] = JSON.parse(data);
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(id, 10));
    if (todoIndex === -1) {
      return res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
    }
    if (text !== undefined) {
      todos[todoIndex].text = text.trim();
    }
    if (completed !== undefined) {
      todos[todoIndex].completed = completed;
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
    res.status(200).json({ message: '待办事项部分更新成功', data: todos[todoIndex], timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('更新待办事项失败:', error);
    res.status(500).json({ error: '更新待办事项失败', message: error instanceof Error ? error.message : '未知错误', timestamp: new Date().toISOString() });
  }
}) as any);

// 【删】删除待办事项 - DELETE /api/todos/:id
app.delete('/api/todos/:id', (async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
    }
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const todos: Todo[] = JSON.parse(data);
    const todoIndex = todos.findIndex(todo => todo.id === parseInt(id, 10));
    if (todoIndex === -1) {
      return res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
    }
    const deletedTodo = todos.splice(todoIndex, 1)[0];
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2));
    res.status(200).json({ message: '待办事项删除成功', data: deletedTodo, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    res.status(500).json({ error: '删除待办事项失败', message: error instanceof Error ? error.message : '未知错误', timestamp: new Date().toISOString() });
  }
}) as any);

// 简单的 GET /welcome 路由 - Express 5 版本
app.get('/welcome', (req: Request, res: Response) => {
  res.json({
    message: '欢迎使用 Express 5 后端服务器！',
    version: 'Express 5.1.0',
    status: 'success',
    timestamp: new Date().toISOString(),
    features: [
      '改进的错误处理',
      '更好的 TypeScript 支持',
      '新的路由功能',
      '性能优化'
    ]
  });
});

// Express 5 的错误处理中间件
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Express 5 错误处理:', err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message,
    version: 'Express 5',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Express 5 TypeScript 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 访问 GET /welcome 路由查看欢迎信息`);
  console.log(`✨ 使用 Express 5 + TypeScript 的新特性！`);
  console.log(`🔄 RESTful API 端点:`);
  console.log(`   GET    /api/todos     - 获取所有待办事项`);
  console.log(`   GET    /api/todos/:id - 获取单个待办事项`);
  console.log(`   POST   /api/todos     - 创建待办事项`);
  console.log(`   PUT    /api/todos/:id - 完整更新待办事项`);
  console.log(`   PATCH  /api/todos/:id - 部分更新待办事项`);
  console.log(`   DELETE /api/todos/:id - 删除待办事项`);
}); 