import { PrismaClient } from '@prisma/client';

// 创建 PrismaClient 实例
const prisma = new PrismaClient();

// 优雅关闭连接
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 