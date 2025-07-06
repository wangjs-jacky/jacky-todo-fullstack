import { useState, useEffect } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
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
      setError('获取数据失败，请检查后端服务是否运行');
    }
  };

  const refreshTodos = async () => {
    if (todos.length === 0) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    try {
      await fetchTodos()
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    refreshTodos()
  }, [])

  // 添加新的待办事项
  const addTodo = async () => {
    if (inputValue.trim() === '') return

    const newTodo = {
      text: inputValue.trim(),
      completed: false
    }

    setInputValue('');

    try {
      const response = await fetch(`http://localhost:3001/api/todos`, {
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
      console.log('创建成功:', result);

      // 重新获取数据以更新列表
      await refreshTodos();
    } catch (error) {
      console.error('创建待办事项失败:', error);
      setError('创建待办事项失败，请重试');
    }
  }

  // 处理回车键添加
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  // 切换待办事项状态
  const toggleTodo = async (id, checked) => {
    try {
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: checked })
      });

      await refreshTodos()
    } catch (error) {
      console.error('更新待办事项失败:', error);
      setError('更新待办事项失败，请重试');
    }
  }

  // 删除待办事项
  const deleteTodo = async (id) => {
    try {
      // 发送删除请求
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'DELETE',
      });
      // 删除成功后，更新待办事项列表
      await refreshTodos()
    } catch (error) {
      console.error('删除待办事项失败:', error);
      setError('删除待办事项失败，请重试');
    }
  }

  // 开始编辑待办事项
  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditValue(todo.text)
  }

  // 保存编辑
  const saveEdit = async (id) => {
    if (editValue.trim() === '') return;
    try {
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editValue.trim() })
      });

      setEditingId(null);
      setEditValue('');
      await refreshTodos()
    } catch (error) {
      console.error('保存编辑失败:', error);
      setError('保存编辑失败，请重试');
    }
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
            onClick={refreshTodos}
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
      <div className="todo-list-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <span>加载中...</span>
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">暂无待办事项，添加一个吧！</div>
        ) : (
          <ul className="todo-list">
            {/* 刷新蒙层 */}
            {refreshing && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <span>刷新中...</span>
              </div>
            )}
            
            {/* 待办事项列表 */}
            {todos.map(todo => (
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
            ))}
          </ul>
        )}
      </div>

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