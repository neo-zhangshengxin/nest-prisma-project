import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 生成或获取 traceId
    const traceId = req.headers['x-trace-id'] as string || uuidv4();
    
    // 将 traceId 存储到请求对象中
    (req as any).traceId = traceId;
    
    // 添加到响应头中
    res.setHeader('X-Trace-Id', traceId);
    
    next();
  }
}
