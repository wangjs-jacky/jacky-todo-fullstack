import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [sortBy, setSortBy] = useState('updatedAt') // 默认按更新时间排序
  const [sortOrder, setSortOrder] = useState('desc') // 默认倒序
  const [searchTerm, setSearchTerm] = useState('') // 搜索关键词
  const [searchInput, setSearchInput] = useState('') // 搜索输入框的值
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    uncompleted: 0,
    currentPageCount: 0
  })
  const containerRef = useRef(null)
  const searchTimeoutRef = useRef(null) // 防抖定时器

  // 从 URL 获取查询参数
  const getQueryParams = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      page: parseInt(urlParams.get('page')) || 1,
      limit: parseInt(urlParams.get('limit')) || 10,
      sortBy: urlParams.get('sortBy') || 'updatedAt',
      sortOrder: urlParams.get('sortOrder') || 'desc',
      search: urlParams.get('search') || ''
    }
  }

  // 从后端获取待办事项数据
  const fetchTodos = async (page = null, limit = null, append = false) => {
    try {
      setError(null)
      
      // 如果没有传入参数，从 URL 获取
      const params = page !== null && limit !== null 
        ? { page, limit, sortBy, sortOrder, search: searchTerm }
        : getQueryParams()
      
      const response = await fetch(`http://localhost:3001/api/todos?page=${params.page}&limit=${params.limit}&sortBy=${params.sortBy}&sortOrder=${params.sortOrder}&search=${encodeURIComponent(params.search)}`)
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
      
      // 更新统计信息
      if (result.statistics) {
        setStatistics(result.statistics)
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
    // 从 URL 初始化搜索状态
    const params = getQueryParams()
    setSearchTerm(params.search)
    setSearchInput(params.search) // 同时初始化输入框
    setSortBy(params.sortBy)
    setSortOrder(params.sortOrder)
    
    refreshTodos()
  }, [])

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
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

  // 处理排序变化
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    // 更新 URL 参数
    const url = new URL(window.location)
    url.searchParams.set('sortBy', newSortBy)
    url.searchParams.set('sortOrder', newSortOrder)
    url.searchParams.set('page', '1') // 重置到第一页
    window.history.pushState({}, '', url)
    // 重新获取数据
    refreshTodos()
  }

  // 防抖搜索函数
  const debouncedSearch = useCallback((newSearchTerm) => {
    setSearchTerm(newSearchTerm)
    // 更新 URL 参数
    const url = new URL(window.location)
    if (newSearchTerm.trim()) {
      url.searchParams.set('search', newSearchTerm)
    } else {
      url.searchParams.delete('search')
    }
    url.searchParams.set('page', '1') // 重置到第一页
    window.history.pushState({}, '', url)
    // 重新获取数据
    refreshTodos()
  }, [])

  // 处理搜索输入变化（带防抖）
  const handleSearchInputChange = (newSearchInput) => {
    setSearchInput(newSearchInput)
    
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // 设置新的防抖定时器（500ms）
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(newSearchInput)
    }, 500)
  }

  // 清空搜索
  const clearSearch = () => {
    setSearchInput('')
    handleSearchInputChange('')
  }

  return (
    <div className="max-w-6xl mx-auto my-12 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">📝 TODO List</h1>
      
      <div className="flex gap-6">
        {/* 主要内容区域 */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">

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
      <div className="relative h-96 border border-gray-200 rounded-lg bg-white overflow-hidden" ref={containerRef}>
        {/* 刷新蒙层 */}
        {refreshing && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-80 z-20">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
              <span className="text-lg text-gray-700">刷新中...</span>
            </div>
          </div>
        )}
        {/* 列表内容加滚动 */}
        <div className="h-full overflow-y-auto">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <span className="text-lg text-gray-600">加载中...</span>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center text-gray-500 italic py-10 px-5 bg-white rounded-lg">暂无待办事项，添加一个吧！</div>
          ) : (
            <>
              <ul className="relative">
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
      </div>



      {/* 操作提示 */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        提示：双击文本可快速编辑，按回车保存，按ESC取消
      </div>
        </div>

        {/* 右侧侧边栏 */}
        <div className="w-80 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">🔍 搜索与排序</h2>
          
          {/* 搜索面板 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">搜索</h3>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                placeholder="输入关键词搜索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="清空搜索"
                >
                  ✕
                </button>
              )}
            </div>
            
            {searchInput && searchInput !== searchTerm && (
              <div className="mt-2 text-gray-500 text-sm">
                搜索中...
              </div>
            )}
            
            {searchTerm && (
              <div className="mt-2 text-blue-600 text-sm">
                搜索: "{searchTerm}"
              </div>
            )}
          </div>

          {/* 排序面板 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">排序</h3>
            
            <div className="space-y-3">
              {/* 排序字段选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  排序字段
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value, sortOrder)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="updatedAt">更新时间</option>
                  <option value="createdAt">创建时间</option>
                  <option value="id">ID</option>
                  <option value="text">文本内容</option>
                  <option value="completed">完成状态</option>
                </select>
              </div>

              {/* 排序顺序选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  排序顺序
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => handleSortChange(sortBy, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">降序</option>
                  <option value="asc">升序</option>
                </select>
              </div>
            </div>

            {/* 排序说明 */}
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600">
                {sortBy === 'updatedAt' && '按更新时间排序'}
                {sortBy === 'createdAt' && '按创建时间排序'}
                {sortBy === 'id' && '按ID排序'}
                {sortBy === 'text' && '按文本排序'}
                {sortBy === 'completed' && '按完成状态排序'}
              </div>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-700 mb-3">统计</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>总计: {statistics.total} 项</div>
              <div>已完成: {statistics.completed} 项</div>
              <div>未完成: {statistics.uncompleted} 项</div>
              {searchTerm && (
                <div className="text-blue-600">
                  搜索结果: {statistics.currentPageCount} 项
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 