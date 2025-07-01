# Jacky Todo Fullstack 应用

这是一个使用 Express.js 和 React 构建的全栈待办事项应用，用于学习前后端开发。

## 项目结构

```
jacky-todo-fullstack/
├── ✅ frontend/          # 前端项目 (Vite + React)
│   ├── ✅ package.json
│   ├── ✅ index.html
│   ├── ✅ src/
│   │   ├── ✅ main.jsx
│   │   ├── ✅ App.jsx    # 主要的TODO组件
│   │   └── ✅ style.css
│   └── ✅ vite.config.js
├── backend/           # 后端项目（待实现）
│   ├── package.json
│   └── server.js
├── ✅ EXPRESS_TUTORIAL_PROMPT.md
└── ✅ README.md
```

## 前端部分

### 功能特性
- ✅ **增加** - 添加新的待办事项
- ✅ **删除** - 删除待办事项
- ✅ **修改** - 编辑待办事项内容
- ✅ **查询** - 显示所有待办事项列表
- ✅ 标记待办事项为已完成/未完成
- ✅ 统计信息显示
- ✅ 多种编辑方式（按钮点击、双击文本）

### 编辑功能说明
- ✅ **双击文本** - 快速进入编辑模式
- ✅ **编辑按钮** - 点击进入编辑模式
- ✅ **保存方式** - 点击保存按钮、按回车键、失去焦点
- ✅ **取消编辑** - 点击取消按钮、按ESC键

### 前端技术栈
- ✅ Vite - 构建工具
- ✅ React 18 - 前端框架
- ✅ CSS - 样式（无UI库）

### 运行前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000 查看应用

## 后端部分

后端部分将使用 Express.js 实现，提供 RESTful API 接口。

### 计划功能
- [ ] GET /api/todos - 获取所有待办事项
- [ ] POST /api/todos - 创建新的待办事项
- [ ] PUT /api/todos/:id - 更新待办事项
- [ ] DELETE /api/todos/:id - 删除待办事项

## 技术栈

### 前端
- React 18 - 用户界面框架
- Vite - 构建工具
- CSS - 样式设计

### 后端
- Express.js - Node.js Web 框架
- RESTful API - 数据接口设计

## 学习重点

1. Express 基础路由设置
2. RESTful API 设计
3. 前后端数据交互
4. React 基础组件开发
5. 状态管理（useState）

## 开发说明

- 保持代码简洁，适合初学者学习
- 不使用复杂的技术栈
- 专注于基础概念教学
- 所有功能尽量在一个文件中完成 