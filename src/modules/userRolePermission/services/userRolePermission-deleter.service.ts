import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class UserRolePermissionDeleterService {
  constructor(private readonly _prisma: PrismaService) {}

  async delete(id: number) {
    const existing = await this._prisma.userRolePermission.findUnique({
      where: { id },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('الربط غير موجود');
    }

    await this._prisma.userRolePermission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async removePermissionFromRole(userRoleId: number, permissionId: number) {
    const existing = await this._prisma.userRolePermission.findFirst({
      where: {
        userRoleId,
        permissionId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new NotFoundException('الربط غير موجود');
    }

    await this._prisma.userRolePermission.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}