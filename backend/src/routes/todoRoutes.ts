import { Router } from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo
} from '../controller/TodoController';

const router = Router();

// 【查】获取所有待办事项 - GET /api/todos
router.get('/', getAllTodos);

// 【查】获取单个待办事项 - GET /api/todos/:id
router.get('/:id', getTodoById);

// 【增】创建待办事项 - POST /api/todos
router.post('/', createTodo);

// 【改】完整更新待办事项 - PUT /api/todos/:id
router.put('/:id', updateTodo);

// 【改】部分更新待办事项 - PATCH /api/todos/:id
router.patch('/:id', patchTodo);

// 【删】删除待办事项 - DELETE /api/todos/:id
router.delete('/:id', deleteTodo);

export default router; 