import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 获取请求对象
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    
    // 获取 traceId
    const traceId = (request as any).traceId || 'unknown';
    
    // 获取控制器和方法信息
    const className = context.getClass().name;
    const methodName = context.getHandler().name;
    const url = request.url;
    const method = request.method;
    
    // 获取请求参数
    const body = request.body;
    const query = request.query;
    const params = request.params;
    
    // 记录方法开始执行的日志，包含入参
    const startTime = Date.now();
    this.logger.log(`[${traceId}] ${className}.${methodName} - ${method} ${url} - 开始执行`);
    this.logger.log(`[${traceId}] 请求参数: body=${JSON.stringify(body)}, query=${JSON.stringify(query)}, params=${JSON.stringify(params)}`);
    
    // 处理响应
    return next.handle().pipe(
      tap({
        next: (response) => {
          // 记录方法执行成功的日志，包含完整的响应结果
          const executionTime = Date.now() - startTime;
          this.logger.log(`[${traceId}] ${className}.${methodName} - 执行成功，耗时: ${executionTime}ms`);
          this.logger.log(`[${traceId}] 响应结果: ${JSON.stringify(response)}`);
        },
        error: (error) => {
          // 记录方法执行失败的日志，包含错误栈
          const executionTime = Date.now() - startTime;
          this.logger.error(`[${traceId}] ${className}.${methodName} - 执行失败，耗时: ${executionTime}ms`);
          this.logger.error(`[${traceId}] 错误信息: ${error.message}`);
          this.logger.error(`[${traceId}] 错误栈: ${error.stack || '无错误栈信息'}`);
        },
      }),
    );
  }
}
