import { useState, useEffect, useRef } from 'react'
import 'tailwindcss/tailwind.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10
  })
  const [hasMore, setHasMore] = useState(true)
  const containerRef = useRef(null)

  // 从 URL 获取查询参数
  const getQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      page: parseInt(urlParams.get('page')) || 1,
      limit: parseInt(urlParams.get('limit')) || 10
    }
  }

  // 从后端获取待办事项数据
  const fetchTodos = async (page = null, limit = null, append = false) => {
    try {
      setError(null)
      
      // 如果没有传入参数，从 URL 获取
      const params = page !== null && limit !== null 
        ? { page, limit }
        : getQueryParams()
      
      const response = await fetch(`http://localhost:3001/api/todos?page=${params.page}&limit=${params.limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      
      // 如果是追加模式，将新数据添加到现有数据后面
      if (append) {
        setTodos(prevTodos => [...prevTodos, ...(result.data || [])])
      } else {
        setTodos(result.data || [])
      }
      
      // 更新分页信息
      if (result.pagination) {
        setPagination(result.pagination)
        // 检查是否还有更多数据
        setHasMore(result.pagination.currentPage < result.pagination.totalPages)
      }
      
    } catch (err) {
      console.error('获取待办事项失败:', err)
      setError('获取数据失败，请检查后端服务是否运行');
    }
  };

  // 加载更多数据
  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const nextPage = pagination.currentPage + 1
      await fetchTodos(nextPage, pagination.limit, true)
    } finally {
      setLoadingMore(false)
    }
  }

  // 滚动监听
  const handleScroll = () => {
    if (!containerRef.current || loadingMore || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    // 当滚动到距离底部100px时触发加载
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      loadMore()
    }
  }

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

  // 监听浏览器前进后退
  useEffect(() => {
    const handlePopState = () => {
      refreshTodos()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 添加滚动监听
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [loadingMore, hasMore])

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
    <div className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">📝 TODO List</h1>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-center">
          {error}
          <button
            onClick={refreshTodos}
            className="ml-3 px-3 py-1 bg-red-600 text-white border-none rounded text-sm cursor-pointer hover:bg-red-700"
          >
            重试
          </button>
        </div>
      )}

      {/* 添加新待办事项的表单 */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入新的待办事项..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="px-6 py-3 bg-blue-500 text-white border-none rounded-lg cursor-pointer text-base font-medium hover:bg-blue-600 transition-colors"
          onClick={addTodo}
        >
          添加
        </button>
      </div>

      {/* 待办事项列表 */}
      <div className="relative max-h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white" ref={containerRef}>
        {loading ? (
          <div className="text-center py-10 text-gray-600 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span>加载中...</span>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center text-gray-500 italic py-10 px-5 bg-white rounded-lg">暂无待办事项，添加一个吧！</div>
        ) : (
          <>
            <ul className="relative">
              {/* 刷新蒙层 */}
              {refreshing && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col justify-center items-center gap-4 z-10 rounded-lg">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>刷新中...</span>
                </div>
              )}
              
              {/* 待办事项列表 */}
              {todos.map(todo => (
                <li key={todo.id} className="flex items-center p-4 border-b border-gray-100 gap-3 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer"
                    checked={todo.completed}
                    onChange={(e) => {
                      toggleTodo(todo.id, e.target.checked)
                    }}
                  />

                  {/* 显示文本或编辑输入框 */}
                  {editingId === todo.id ? (
                    <div className="flex-1 flex gap-3 items-center">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border-2 border-blue-500 rounded text-base focus:outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => handleEditKeyPress(e, todo.id)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-500 text-white border-none rounded cursor-pointer text-sm hover:bg-green-600"
                          onClick={() => saveEdit(todo.id)}
                        >
                          保存
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-500 text-white border-none rounded cursor-pointer text-sm hover:bg-gray-600"
                          onClick={cancelEdit}
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span
                      className={`flex-1 text-base text-gray-800 cursor-pointer p-2 rounded transition-colors hover:bg-gray-100 ${
                        todo.completed ? 'line-through text-gray-500' : ''
                      }`}
                      onDoubleClick={() => startEdit(todo)}
                    >
                      {todo.text}
                    </span>
                  )}

                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-yellow-400 text-gray-800 border-none rounded cursor-pointer text-sm hover:bg-yellow-500"
                      onClick={() => startEdit(todo)}
                    >
                      编辑
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white border-none rounded cursor-pointer text-sm hover:bg-red-600"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* 加载更多区域 */}
            <div className="p-5 text-center border-t border-gray-200 bg-white">
              {loadingMore ? (
                <div className="flex flex-col items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <span>加载更多...</span>
                </div>
              ) : hasMore ? (
                <button 
                  className="px-5 py-2 bg-blue-500 text-white border-none rounded cursor-pointer text-sm hover:bg-blue-600 transition-colors"
                  onClick={loadMore}
                >
                  加载更多
                </button>
              ) : (
                <div className="text-gray-500 italic py-2">
                  已加载全部数据
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 统计信息 */}
      {todos.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          总计: {pagination.totalCount} 项 |
          已完成: {todos.filter(todo => todo.completed).length} 项 |
          未完成: {todos.filter(todo => !todo.completed).length} 项
        </div>
      )}

      {/* 操作提示 */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        提示：双击文本可快速编辑，按回车保存，按ESC取消
      </div>
    </div>
  )
}

export default App 