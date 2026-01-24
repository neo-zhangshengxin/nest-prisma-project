import { Controller, Get, Query } from '@nestjs/common';
import { PhoneService } from './phone.service';

@Controller('phone')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<any> {
    const pagination = {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined
    };
    return this.phoneService.findAll(pagination);
  }
}