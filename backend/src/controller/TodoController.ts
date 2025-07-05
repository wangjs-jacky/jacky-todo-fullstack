import { Request, Response } from 'express';
import fs from 'fs/promises';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../interface';

const DATA_FILE: string = process.env.DATA_FILE_PATH || './data.json';

// 获取所有待办事项
export const getAllTodos = async (req: Request, res: Response) => {
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
};

// 获取单个待办事项
export const getTodoById = async (req: Request<{ id: string }>, res: Response) => {
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
};

// 创建待办事项
export const createTodo = async (req: Request, res: Response) => {
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
};

// 完整更新待办事项
export const updateTodo = async (req: Request<{ id: string }>, res: Response) => {
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
};

// 部分更新待办事项
export const patchTodo = async (req: Request<{ id: string }>, res: Response) => {
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
};

// 删除待办事项
export const deleteTodo = async (req: Request<{ id: string }>, res: Response) => {
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
}; 