import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

async function showAllTodos() {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    // 使用 ORM 查询 todo 表所有数据
    const todos = await prisma.todo.findMany({ orderBy: { id: 'asc' } });
    console.log('📋 todo 表所有数据 (ORM 查询):');
    console.table(todos);
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showAllTodos(); 