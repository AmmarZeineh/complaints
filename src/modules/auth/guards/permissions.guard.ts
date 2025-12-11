// src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // لا توجد صلاحيات مطلوبة
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User from request:', user); // ✅ للتأكد
console.log("User in guard:", request.user);

    if (!user || !user.roleId) {
      throw new ForbiddenException('المستخدم غير مصرح له بالوصول');
    }

    // جلب صلاحيات المستخدم من قاعدة البيانات
    const userPermissions = await this.prisma.userRolePermission.findMany({
      where: {
        userRoleId: user.roleId,
        deletedAt: null,
      },
      include: {
        permission: {
          select: {
            name: true,
          },
        },
      },
    });

    const permissionNames = userPermissions.map(
      (rp) => rp.permission.name,
    );

    // التحقق من وجود الصلاحية المطلوبة
    const hasPermission = requiredPermissions.some((permission) =>
      permissionNames.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `ليس لديك صلاحية "${requiredPermissions.join(', ')}" للوصول لهذا المورد`,
      );
    }

    return true;
  }
}

// Decorator للصلاحيات
import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);