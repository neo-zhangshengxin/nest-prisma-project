import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PhoneController } from './phone/phone.controller';
import { PhoneService } from './phone/phone.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController, PhoneController],
  providers: [AppService, PrismaService, PhoneService],
})
export class AppModule {}
