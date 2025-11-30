import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { selectPermissionValidator } from '../validators/select-permission-validator';

@Injectable()
export class PermissionCreatorService {
  constructor(private readonly _prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    const existing = await this._prisma.permission.findUnique({
      where: { name: dto.name, deletedAt: null },
    });

    if (existing) {
      throw new ConflictException('اسم الصلاحية موجود بالفعل');
    }

    return await this._prisma.permission.create({
      data: {
        name: dto.name,
      },
      select: selectPermissionValidator(),
    });
  }
}