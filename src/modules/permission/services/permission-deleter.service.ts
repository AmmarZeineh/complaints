import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class PermissionDeleterService {
  constructor(private readonly _prisma: PrismaService) {}

  async delete(id: number) {
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

    await this._prisma.permission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}