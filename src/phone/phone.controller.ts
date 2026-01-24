import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PhoneService } from './phone.service';

@Controller('phone')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<any> {
    const pagination = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    };
    return this.phoneService.findAll(pagination);
  }

  @Post('add')
  async add(@Body() phone: { name: string; price: number; stock: number; isDiscount?: boolean }) {
    return this.phoneService.add(phone);
  }

  @Post('update')
  async update(@Body() body: { id: number; name?: string; price?: number; stock?: number; isDiscount?: boolean }) {
    const { id, ...data } = body;
    return this.phoneService.update(id, data);
  }

}