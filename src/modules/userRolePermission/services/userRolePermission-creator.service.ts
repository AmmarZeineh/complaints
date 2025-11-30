import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { AssignPermissionsDto } from '../dtos/assign-permission.dto';
// import { AssignPermissionsDto } from '../dtos/assign-permission.dto';
import { selectUserRolePermissionValidator } from '../validators/select-userRolePermission-validator';

@Injectable()
export class UserRolePermissionCreatorService {
  constructor(private readonly _prisma: PrismaService) {}

  // // الدالة القديمة (للصلاحية الواحدة)
  // async assign(dto: AssignPermissionDto) {
  //   const userRole = await this._prisma.userRole.findUnique({
  //     where: { id: dto.userRoleId, deletedAt: null },
  //   });

  //   if (!userRole) {
  //     throw new NotFoundException('الدور غير موجود');
  //   }

  //   const permission = await this._prisma.permission.findUnique({
  //     where: { id: dto.permissionId, deletedAt: null },
  //   });

  //   if (!permission) {
  //     throw new NotFoundException('الصلاحية غير موجودة');
  //   }

  //   const existing = await this._prisma.userRolePermission.findFirst({
  //     where: {
  //       userRoleId: dto.userRoleId,
  //       permissionId: dto.permissionId,
  //       deletedAt: null,
  //     },
  //   });

  //   if (existing) {
  //     throw new ConflictException('هذه الصلاحية مرتبطة بالدور بالفعل');
  //   }

  //   return await this._prisma.userRolePermission.create({
  //     data: {
  //       userRoleId: dto.userRoleId,
  //       permissionId: dto.permissionId,
  //     },
  //     select: selectUserRolePermissionValidator(),
  //   });
  // }

  async assignMultiple(dto: AssignPermissionsDto) {
    const userRole = await this._prisma.userRole.findUnique({
      where: { id: dto.userRoleId, deletedAt: null },
    });

    if (!userRole) {
      throw new NotFoundException('الدور غير موجود');
    }

    const permissions = await this._prisma.permission.findMany({
      where: {
        id: { in: dto.permissionIds },
        deletedAt: null,
      },
    });

    if (permissions.length !== dto.permissionIds.length) {
      const foundIds = permissions.map(p => p.id);
      const notFoundIds = dto.permissionIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(
        `الصلاحيات التالية غير موجودة: ${notFoundIds.join(', ')}`
      );
    }

    // 3. التحقق من الروابط الموجودة مسبقاً
    const existingLinks = await this._prisma.userRolePermission.findMany({
      where: {
        userRoleId: dto.userRoleId,
        permissionId: { in: dto.permissionIds },
        deletedAt: null,
      },
      select: {
        permissionId: true,
      },
    });

    const existingPermissionIds = existingLinks.map(link => link.permissionId);
    const newPermissionIds = dto.permissionIds.filter(
      id => !existingPermissionIds.includes(id)
    );

    if (newPermissionIds.length === 0) {
      throw new ConflictException('جميع الصلاحيات مرتبطة بالدور بالفعل');
    }

    const created = await this._prisma.$transaction(
      newPermissionIds.map(permissionId =>
        this._prisma.userRolePermission.create({
          data: {
            userRoleId: dto.userRoleId,
            permissionId,
          },
          select: selectUserRolePermissionValidator(),
        })
      )
    );

    return {
      success: true,
      created: created.length,
      skipped: existingPermissionIds.length,
      data: created,
      message: `تم ربط ${created.length} صلاحية بنجاح${
        existingPermissionIds.length > 0
          ? `, تم تجاهل ${existingPermissionIds.length} صلاحية موجودة مسبقاً`
          : ''
      }`,
    };
  }
}