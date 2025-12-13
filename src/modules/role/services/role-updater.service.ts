import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { selectRoleValidator } from '../validators/select-role-validator';

@Injectable()
export class RoleUpdaterService {
  constructor(private readonly _prisma: PrismaService) {}

  async update(id: number, dto: UpdateRoleDto) {
    // التحقق من وجود الدور
    const existing = await this._prisma.userRole.findUnique({
      where: { id },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('الدور غير موجود');
    }

    // إذا كان هناك تحديث للاسم، التحقق من عدم وجود دور آخر بنفس الاسم
    if (dto.name) {
      const duplicateName = await this._prisma.userRole.findFirst({
        where: {
          name: dto.name,
          deletedAt: null,
          NOT: {
            id: id,
          },
        },
      });

      if (duplicateName) {
        throw new ConflictException('يوجد دور آخر بنفس الاسم');
      }
    }

    return await this._prisma.userRole.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
      },
      select: selectRoleValidator(),
    });
  }
}