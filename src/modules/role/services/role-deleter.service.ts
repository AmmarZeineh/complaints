import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class RoleDeleterService {
  constructor(private readonly _prisma: PrismaService) {}

  async delete(id: number) {
    // التحقق من وجود الدور
    const existing = await this._prisma.userRole.findUnique({
      where: { id },
      select: {
        id: true,
        deletedAt: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('الدور غير موجود');
    }

    // التحقق من عدم وجود مستخدمين مرتبطين بهذا الدور
    if (existing._count.users > 0) {
      throw new BadRequestException(
        `لا يمكن حذف الدور لأنه يحتوي على ${existing._count.users} مستخدم/مستخدمين`,
      );
    }

    // حذف soft delete للدور
    await this._prisma.userRole.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // حذف soft delete لجميع الصلاحيات المرتبطة
    await this._prisma.userRolePermission.updateMany({
      where: {
        userRoleId: id,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }
}