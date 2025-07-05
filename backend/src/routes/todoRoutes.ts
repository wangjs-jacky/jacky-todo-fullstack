import { Router } from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  patchTodo,
  deleteTodo
} from '../controller/TodoController';

const router: Router = Router();

// 使用 router.route() 进行链式写法
router.route('/')
  .get(getAllTodos)    // 【查】获取所有待办事项 - GET /api/todos
  .post(createTodo);   // 【增】创建待办事项 - POST /api/todos

router.route('/:id')
  .get(getTodoById)    // 【查】获取单个待办事项 - GET /api/todos/:id
  .put(updateTodo)     // 【改】完整更新待办事项 - PUT /api/todos/:id
  .patch(patchTodo)    // 【改】部分更新待办事项 - PATCH /api/todos/:id
  .delete(deleteTodo); // 【删】删除待办事项 - DELETE /api/todos/:id

export default router; 