import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhoneService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: { page?: number; pageSize?: number }): Promise<any> {
    const { page = 1, pageSize = 10 } = pagination;
    const skip = (page - 1) * pageSize;

    const [phones, total] = await Promise.all([
      this.prisma.phone.findMany({
        where: {
          isDeleted: false
        },
        skip,
        take: pageSize,
        orderBy: {
          id: 'asc',
        }
      }),
      this.prisma.phone.count({
        where: {
          isDeleted: false
        }
      })
    ]);

    const convertedPhones = phones.map(phone => ({
    ...phone,
    id: Number(phone.id) // 将 BigInt 转换为 Number
  }));

    return {
      data: convertedPhones,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async add(phone: { name: string; price: number; stock: number, isDiscount?: boolean }) {
    const createdPhone = await this.prisma.phone.create({
      data: {
        ...phone,
        isDeleted: false
      }
    });
    return {
      ...createdPhone,
      id: Number(createdPhone.id) // 将 BigInt 转换为 Number
    };
  }
}