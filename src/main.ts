import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WinstonLoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLoggerService(), // 使用 WinstonLoggerService 作为日志服务
  });
  
  // 使用全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // 使用全局响应拦截器，确保所有成功响应都包含 traceId
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // 使用全局日志拦截器，自动记录请求的 traceId、入参和结果
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
