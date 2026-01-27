import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

// 定义响应格式接口
interface ResponseFormat<T> {
  success: boolean;
  data: T;
  traceId: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    // 获取请求对象
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    
    // 获取 traceId
    const traceId = (request as any).traceId || 'unknown';
    
    // 处理响应
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        traceId,
      })),
    );
  }
}
