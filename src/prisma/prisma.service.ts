// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client'; // 自动包含 db pull 生成的所有 model
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      adapter: new PrismaMariaDb({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT ?? '3306'),
        connectionLimit: 10,
        password: process.env.DB_PASSWORD,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
      })
    });
  }

  // Nest 模块初始化时，连接数据库
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma 数据库连接成功（CJS 模式）');
    } catch (error) {
      this.logger.error('❌ Prisma 数据库连接失败', error.stack);
      process.exit(1); // 连接失败直接终止应用，避免启动后报错
    }
  }

  // Nest 模块销毁时，断开数据库连接
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Prisma 数据库连接已断开');
  }
}