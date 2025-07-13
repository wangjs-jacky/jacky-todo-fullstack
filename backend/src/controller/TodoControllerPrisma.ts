import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../interface.js';
import { createChildLogger } from '../lib/logger.js';
import AppError from '../lib/AppError.js';

const logger = createChildLogger('TodoController');

// 获取所有待办事项（支持分页）
export const getAllTodos = async (req: Request, res: Response): Promise<void> => {
  try {
    // 获取分页和排序参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5; // 默认每页5条
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'updatedAt'; // 默认按更新时间排序
    const sortOrder = req.query.sortOrder as string || 'desc'; // 默认倒序
    const search = req.query.search as string || ''; // 搜索关键词

    // 验证排序参数
    const validSortFields = ['id', 'createdAt', 'updatedAt', 'text', 'completed'];
    const validSortOrders = ['asc', 'desc'];

    if (!validSortFields.includes(sortBy)) {
      res.status(400).json({
        error: '无效的排序字段',
        validFields: validSortFields,
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!validSortOrders.includes(sortOrder)) {
      res.status(400).json({
        error: '无效的排序顺序',
        validOrders: validSortOrders,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // 构建搜索条件
    const where: any = {};
    if (search.trim()) {
      where.text = {
        contains: search.trim(),
        mode: 'insensitive' // 不区分大小写
      };
    }

    // 获取总数（包含搜索条件）
    const totalCount = await prisma.todo.count({ where });

    // 获取已完成数量（包含搜索条件）
    const completedCount = await prisma.todo.count({
      where: {
        ...where,
        completed: true
      }
    });

    // 获取未完成数量（包含搜索条件）
    const uncompletedCount = await prisma.todo.count({
      where: {
        ...where,
        completed: false
      }
    });

    // 构建排序对象
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // 获取分页数据（包含搜索条件）
    const todos = await prisma.todo.findMany({
      where: where,
      orderBy: orderBy,
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
      statistics: {
        total: totalCount,
        completed: completedCount,
        uncompleted: uncompletedCount,
        currentPageCount: todos.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error({
      msg: '读取待办事项失败',
      reqId: req.id,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new AppError('读取数据失败', 500);
  }
};

// 获取单个待办事项
export const getTodoById = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
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
    logger.error({
      msg: '获取待办事项失败',
      reqId: req.id,
      todoId: id,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new AppError('获取待办事项失败', 500);
  }
};

// 创建待办事项
export const createTodo = async (req: Request, res: Response): Promise<void> => {
  const { text, completed = false }: CreateTodoRequest = req.body;
  try {
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
    logger.error({
      msg: '创建待办事项失败',
      reqId: req.id,
      todoText: text,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new AppError('创建待办事项失败', 400 );
  }
};

// 完整更新待办事项
export const updateTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { text, completed }: UpdateTodoRequest = req.body;

  try {
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
      return;
    }

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
    logger.error({
      msg: '完整更新待办事项失败',
      reqId: req.id,
      todoId: id,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
      return;
    }
    throw new AppError('更新待办事项失败', 500);
  }
};

// 部分更新待办事项
export const patchTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;
  const { text, completed }: UpdateTodoRequest = req.body;

  try {
    if (!id) {
      res.status(400).json({ error: '缺少 id 参数', timestamp: new Date().toISOString() });
      return;
    }

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
    logger.error({
      msg: '部分更新待办事项失败',
      reqId: req.id,
      todoId: id,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
      return;
    }
    throw new AppError('更新待办事项失败', 500);
  }
};

// 删除待办事项
export const deleteTodo = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
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
    logger.error({
      msg: '删除待办事项失败',
      reqId: req.id,
      todoId: id,
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      res.status(404).json({ error: '待办事项不存在', timestamp: new Date().toISOString() });
      return;
    }
    throw new AppError('删除待办事项失败', 500);
  }
}; 