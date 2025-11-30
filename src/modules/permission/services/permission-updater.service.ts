import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { selectPermissionValidator } from '../validators/select-permission-validator';

@Injectable()
export class PermissionUpdaterService {
  constructor(private readonly _prisma: PrismaService) {}

  async update(id: number, dto: UpdatePermissionDto) {
    const existing = await this._prisma.permission.findUnique({
      where: { id },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('الصلاحية غير موجودة');
    }

    if (dto.name) {
      const duplicateName = await this._prisma.permission.findUnique({
        where: { name: dto.name, deletedAt: null },
      });

      if (duplicateName && duplicateName.id !== id) {
        throw new ConflictException('اسم الصلاحية موجود بالفعل');
      }
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;

    return await this._prisma.permission.update({
      where: { id },
      data: updateData,
      select: selectPermissionValidator(),
    });
  }
}