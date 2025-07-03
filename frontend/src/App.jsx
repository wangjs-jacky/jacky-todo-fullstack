import { useState, useEffect } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 从后端获取待办事项数据
  const fetchTodos = async () => {
    try {
      setError(null)
      const response = await fetch('http://localhost:3001/api/todos')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setTodos(result.data || [])
    } catch (err) {
      console.error('获取待办事项失败:', err)
      setError('获取数据失败，请检查后端服务是否运行')
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchTodos()
  }, [])

  // 添加新的待办事项
  const addTodo = async () => {
    if (inputValue.trim() === '') return

    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false
    }

    setInputValue('');

    // setTodos([...todos, newTodo])
    const response = await fetch(`http://localhost:3001/api/todos/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTodo)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('添加成功:', result);

    // 重新获取数据以更新列表
    await fetchTodos();
  }

  // 处理回车键添加
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  // 切换待办事项状态
  const toggleTodo = async (id, checked) => {
    // setTodos(todos.map(todo =>
    await fetch(`http://localhost:3001/api/todos/update/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: checked })
    });

    await fetchTodos()
  }

  // 删除待办事项
  const deleteTodo = async (id) => {
    // 发送删除请求
    await fetch(`http://localhost:3001/api/todos/delete/${id}`);
    // 删除成功后，更新待办事项列表
    await fetchTodos()
  }

  // 开始编辑待办事项
  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditValue(todo.text)
  }

  // 保存编辑
  const saveEdit = (id) => {
    if (editValue.trim() === '') return

    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editValue.trim() } : todo
    ))
    setEditingId(null)
    setEditValue('')
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  // 处理编辑时的回车键
  const handleEditKeyPress = (e, id) => {
    if (e.key === 'Enter') {
      saveEdit(id)
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  return (
    <div className="container">
      <h1>📝 TODO List</h1>

      {/* 错误提示 */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
          <button
            onClick={fetchTodos}
            style={{
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#c62828',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      )}

      {/* 添加新待办事项的表单 */}
      <div className="todo-form">
        <input
          type="text"
          className="todo-input"
          placeholder="输入新的待办事项..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="add-btn" onClick={addTodo}>
          添加
        </button>
      </div>

      {/* 待办事项列表 */}
      <ul className="todo-list">
        {!loading && todos.length === 0 ? (
          <li className="empty-state">暂无待办事项，添加一个吧！</li>
        ) : (
          todos.map(todo => (
            <li key={todo.id} className="todo-item">
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={(e) => {
                  toggleTodo(todo.id, e.target.checked)
                }}
              />

              {/* 显示文本或编辑输入框 */}
              {editingId === todo.id ? (
                <div className="edit-container">
                  <input
                    type="text"
                    className="edit-input"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => handleEditKeyPress(e, todo.id)}
                    onBlur={() => saveEdit(todo.id)}
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button
                      className="save-btn"
                      onClick={() => saveEdit(todo.id)}
                    >
                      保存
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={cancelEdit}
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <span
                  className={`todo-text ${todo.completed ? 'completed' : ''}`}
                  onDoubleClick={() => startEdit(todo)}
                >
                  {todo.text}
                </span>
              )}

              <div className="action-buttons">
                <button
                  className="edit-btn"
                  onClick={() => startEdit(todo)}
                >
                  编辑
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                >
                  删除
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* 统计信息 */}
      {todos.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
          总计: {todos.length} 项 |
          已完成: {todos.filter(todo => todo.completed).length} 项 |
          未完成: {todos.filter(todo => !todo.completed).length} 项
        </div>
      )}

      {/* 操作提示 */}
      <div style={{ marginTop: '15px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        提示：双击文本可快速编辑，按回车保存，按ESC取消
      </div>
    </div>
  )
}

export default App 