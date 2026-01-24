import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 记录错误堆栈，方便后端调试
    console.error('Global error:', exception);
    
    // 默认状态码和错误信息
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '操作失败，请稍后重试';
    
    // 根据错误类型返回不同的友好提示
    if (exception.code === 'P2025') { // Prisma 的 RecordNotFound 错误码
      status = HttpStatus.NOT_FOUND;
      // 生成更通用的提示信息，不固定使用 "id"
      message = '找不到对应的数据，请确认查询条件是否有效';
    } else if (exception.code === 'P2002') { // Prisma 的唯一约束错误码
      status = HttpStatus.BAD_REQUEST;
      message = '数据已存在，请检查输入';
    } else if (exception.message && exception.message.includes('Unknown argument')) {
      // 处理未知参数错误，提取参数名
      const unknownArgMatch = exception.message.match(/Unknown argument `(\w+)`/);
      if (unknownArgMatch && unknownArgMatch[1]) {
        const paramName = unknownArgMatch[1];
        message = `识别到未知参数 ${paramName}，请确认参数名是否正确`;
      } else {
        message = '识别到未知参数，请确认参数名是否正确';
      }
    } else if (exception.message && exception.message.includes('Invalid value provided')) {
      // 处理参数值无效错误，提取参数名、期望类型和实际类型
      const invalidValueMatch = exception.message.match(/Argument `(\w+)`: Invalid value provided\. Expected (.+), provided (.+)\./);
      if (invalidValueMatch && invalidValueMatch[1] && invalidValueMatch[2] && invalidValueMatch[3]) {
        const paramName = invalidValueMatch[1];
        const expectedType = invalidValueMatch[2];
        const providedType = invalidValueMatch[3];
        message = `参数 ${paramName} 类型错误，期望 ${expectedType} 类型，实际提供了 ${providedType} 类型`;
      } else {
        message = '参数值无效，请检查输入';
      }
    } else if (exception.message) {
      // 其他错误，使用完整的错误信息作为友好提示
      message = exception.message;
    }
    
    // 返回友好的错误响应
    response.status(status).json({
      success: false,
      message,
    });
  }
}
