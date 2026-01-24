// src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService], // 注册 PrismaService
  exports: [PrismaService],   // 导出，其他模块导入 PrismaModule 就能用
})
export class PrismaModule {}