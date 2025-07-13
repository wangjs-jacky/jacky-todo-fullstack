import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importData() {
  try {
    // 读取 JSON 文件
    const dataPath = path.join(process.cwd(), 'data.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const todos = JSON.parse(rawData)

    console.log('开始导入数据...')
    console.log(`找到 ${todos.length} 条待办事项`)

    // 清空现有数据
    await prisma.todo.deleteMany()
    console.log('已清空现有数据')

    // 导入新数据
    for (const todo of todos) {
      await prisma.todo.create({
        data: {
          id: todo.id,
          text: todo.text,
          completed: todo.completed
        }
      })
    }

    console.log('数据导入完成！')
    
    // 验证数据
    const count = await prisma.todo.count()
    console.log(`数据库中现有 ${count} 条记录`)

  } catch (error) {
    console.error('导入数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importData() 