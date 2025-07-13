import pino from 'pino';

// 环境变量配置
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// 基础配置
const baseConfig = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
};

// 开发环境配置 - 使用多目标输出：控制台美化 + 文件保存
const developmentConfig = {
  ...baseConfig,
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{msg} [id={reqId}]',
        },
      },
      {
        target: 'pino/file',
        options: {
          destination: './logs/app.log',
          mkdir: true,
        },
      },
    ],
  },
};

// 生产环境配置 - JSON 格式输出 + 文件保存
const productionConfig = {
  ...baseConfig,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
    ],
  },
  transport: {
    target: 'pino/file',
    options: {
      destination: './logs/app.log',
      mkdir: true,
    },
  },
};

// 创建日志实例
const logger = pino(isDevelopment ? developmentConfig : productionConfig);

// 创建子日志器
export const createChildLogger = (name: string) => {
  return logger.child({ module: name });
};

// 导出日志实例
export default logger; 