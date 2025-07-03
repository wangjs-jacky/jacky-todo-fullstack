import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 【查】询待办事项
app.get('/api/todos', async (req, res) => {
  try {
    const data = await fs.readFile('./data.json', 'utf8');
    const todos = JSON.parse(data);
    res.status(200).json({
      data: todos,
      count: todos.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('读取 data.json 失败:', error);
    res.status(500).json({
      error: '读取数据失败',
      message: error.message
    });
  }
});


// 【增】待办事项
app.post('/api/todos/add', async (req, res) => {
  try {
    const { text, completed = false } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        error: '待办事项内容不能为空' 
      });
    }
    
    // 读取现有数据
    const data = await fs.readFile('./data.json', 'utf8');
    const todos = JSON.parse(data);
    
    // 创建新的待办事项
    const newTodo = {
      id: Date.now(),
      text: text.trim(),
      completed: completed
    };
    
    // 添加到数组
    todos.push(newTodo);
    
    // 保存到文件
    await fs.writeFile('./data.json', JSON.stringify(todos, null, 2));
    
    res.status(201).json({ 
      code: 200, 
      message: '待办事项添加成功',
      data: newTodo 
    });
  } catch (error) {
    console.error('添加待办事项失败:', error);
    res.status(500).json({ 
      error: '添加待办事项失败',
      message: error.message 
    });
  }
});

// 【删】待办事项
app.post('/api/todos/delete/:id', async (req, res) => {
  const { id } = req.params;
  const data = await fs.readFile('./data.json', 'utf8');
  const todos = JSON.parse(data);
  const todo = todos.find(todo => todo.id === parseInt(id));
  if (!todo) {
    return res.status(200).json({ code: 0, error: '待办事项不存在' });
  }
  const filteredTodos = todos.filter(todo => todo.id != id);
  await fs.writeFile('./data.json', JSON.stringify(filteredTodos, null, 2));
  res.status(200).json({ code: 200, message: '待办事项删除成功' });
});

// 【改】待办事项
app.post('/api/todos/update/:id', async (req, res) => {
  console.log("wjs: req.body",req.body);
  const { id } = req.params;
  const data = await fs.readFile('./data.json', 'utf8');
  const todos = JSON.parse(data);
  const todo = todos.find(todo => todo.id === parseInt(id));
  if (!todo) {
    return res.status(200).json({ code: 0, error: '待办事项不存在' });
  }
  // 只有非 undefined 值才更新
  if (req.body.text !== undefined) {
    todo.text = req.body.text;
  }
  if (req.body.completed !== undefined) {
    todo.completed = req.body.completed;
  }
  await fs.writeFile('./data.json', JSON.stringify(todos, null, 2));
  res.status(200).json({ code: 200, message: '待办事项更新成功' });
});

// 简单的 GET / 路由 - Express 5 版本
app.get('/welcome', (req, res) => {
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
app.use((err, req, res, next) => {
  console.error('Express 5 错误处理:', err.stack);
  res.status(500).json({
    error: '服务器内部错误',
    message: err.message,
    version: 'Express 5'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Express 5 服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 访问 GET / 路由查看欢迎信息`);
  console.log(`✨ 使用 Express 5 的新特性！`);
}); 