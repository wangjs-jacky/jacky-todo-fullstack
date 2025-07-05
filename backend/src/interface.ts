// Todo 应用的类型定义

// 基础 Todo 接口
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// 请求体接口
export interface CreateTodoRequest {
  text: string;
  completed?: boolean;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
}

// 通用 API 响应接口
export interface ApiResponse<T> {
  data?: T;
  count?: number;
  message?: string;
  timestamp: string;
  error?: string;
}

// 特定响应接口
export interface TodosResponse extends ApiResponse<Todo[]> {
  data: Todo[];
  count: number;
}

export interface SingleTodoResponse extends ApiResponse<Todo> {
  data: Todo;
}

export interface MessageResponse extends ApiResponse<never> {
  message: string;
}

export interface ErrorResponse extends ApiResponse<never> {
  error: string;
  message?: string;
}

// 欢迎信息接口
export interface WelcomeResponse {
  message: string;
  version: string;
  status: string;
  timestamp: string;
  features: string[];
}

// 服务器配置接口
export interface ServerConfig {
  port: number;
  dataFile: string;
  corsOrigin: string;
} 