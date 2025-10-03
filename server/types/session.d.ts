import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      _id: string;
      username: string;
      email?: string;  // 改为可选字段
      admin?: boolean;
      [key: string]: any;
    };
  }
}