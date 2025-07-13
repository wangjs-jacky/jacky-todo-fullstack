class AppError extends Error {
  statusCode: number;
  errorMessage: string;
  constructor(message: string, statusCode: number ) {
    super(message);
    // 扩展 Error 类
    this.statusCode = statusCode;
  }
}

export default AppError;