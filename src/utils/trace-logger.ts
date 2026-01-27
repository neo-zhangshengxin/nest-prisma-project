import { Injectable, Logger, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class TraceLogger extends Logger {
  private traceId: string;

  constructor(@Inject(REQUEST) private request: any) {
    super();
    this.traceId = request?.traceId || 'unknown';
  }

  log(message: string, context?: string) {
    super.log(`[${this.traceId}] ${message}`, context);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(`[${this.traceId}] ${message}`, trace, context);
  }

  warn(message: string, context?: string) {
    super.warn(`[${this.traceId}] ${message}`, context);
  }

  debug(message: string, context?: string) {
    super.debug(`[${this.traceId}] ${message}`, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(`[${this.traceId}] ${message}`, context);
  }
}
