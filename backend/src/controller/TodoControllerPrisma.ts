import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../interface.js';

// 获取所有待办事项（支持分页）
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    // 获取分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5; // 默认每页5条
    const skip = (page - 1) * limit;


    // 获取总数
    const totalCount = await prisma.todo.count();
    
    // 获取分页数据
    const todos = await prisma.todo.findMany({
      orderBy: {
        id: 'desc', // 按ID倒序，最新的数据在前面
      },
      skip: skip,
      take: limit,
    });

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      data: todos,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        limit: limit,
        hasNextPage: hasNextPage,
        hasPrevPage: hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('读取待办事项失败:', error);
    res.status(500).json({
      error: '读取数据失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
};

// 获取单个待办事项
export const getTodoById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
      return;
    }

    const todo = await prisma.todo.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!todo) {
      res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
      return;
    }

    res.status(200).json({ data: todo, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('获取待办事项失败:', error);
    res.status(500).json({
      error: '获取待办事项失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
};

// 创建待办事项
export const createTodo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, completed = false }: CreateTodoRequest = req.body;
    if (!text || text.trim() === '') {
      res.status(400).json({ error: '待办事项内容不能为空', timestamp: new Date().toISOString() });
      return;
    }

    const newTodo = await prisma.todo.create({
      data: {
        id: Date.now(),
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
    console.error('创建待办事项失败:', error);
    res.status(500).json({
      error: '创建待办事项失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
};

// 完整更新待办事项
export const updateTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
      return;
    }

    const { text, completed }: UpdateTodoRequest = req.body;
    if (text === undefined || completed === undefined) {
      res.status(400).json({
        error: 'PUT 请求需要提供完整的资源数据（text 和 completed）',
        timestamp: new Date().toISOString()
      });
      return;
    }

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
    console.error('更新待办事项失败:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
      return;
    }
    res.status(500).json({
      error: '更新待办事项失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
};

// 部分更新待办事项
export const patchTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
      return;
    }

    const { text, completed }: UpdateTodoRequest = req.body;
    const updateData: any = {};

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
    console.error('更新待办事项失败:', error);
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
      return;
    }
    res.status(500).json({
      error: '更新待办事项失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
};

// 删除待办事项
export const deleteTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
      return;
    }

    const deletedTodo = await prisma.todo.delete({
      where: { id: parseInt(id, 10) }
    });

    res.status(200).json({
      message: '待办事项删除成功',
      data: deletedTodo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
      return;
    }
    res.status(500).json({
      error: '删除待办事项失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    });
  }
}; 