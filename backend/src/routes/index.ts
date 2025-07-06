import { Router } from 'express';
import todoRoutes from './todoRoutes.js';

const router: Router = Router();

// 注册所有路由模块
router.use('/todos', todoRoutes);

export default router; 