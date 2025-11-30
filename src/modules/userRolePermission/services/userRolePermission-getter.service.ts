import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { selectUserRolePermissionValidator } from '../validators/select-userRolePermission-validator';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRolePermissionGetterService {
  constructor(private readonly _prisma: PrismaService) {}

  async findById(id: number) {
    const rolePermission = await this._prisma.userRolePermission.findUnique({
      where: { id, deletedAt: null },
      select: selectUserRolePermissionValidator(),
    });

    if (!rolePermission) {
      throw new NotFoundException('الربط غير موجود');
    }

    return rolePermission;
  }

  async findAll(pagination: PaginationDto) {
    const { skip, limit } = pagination;

    const where: Prisma.UserRolePermissionWhereInput = {
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this._prisma.userRolePermission.findMany({
        where,
        select: selectUserRolePermissionValidator(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this._prisma.userRolePermission.count({ where }),
    ]);

    return { data, count: total };
  }

  async findByUserRoleId(userRoleId: number, pagination: PaginationDto) {
    const { skip, limit } = pagination;

    // التحقق من وجود الدور
    const userRole = await this._prisma.userRole.findUnique({
      where: { id: userRoleId, deletedAt: null },
    });

    if (!userRole) {
      throw new NotFoundException('الدور غير موجود');
    }

    const where: Prisma.UserRolePermissionWhereInput = {
      userRoleId,
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this._prisma.userRolePermission.findMany({
        where,
        select: selectUserRolePermissionValidator(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this._prisma.userRolePermission.count({ where }),
    ]);

    return { data, count: total };
  }

  async findByPermissionId(permissionId: number, pagination: PaginationDto) {
    const { skip, limit } = pagination;

    // التحقق من وجود الصلاحية
    const permission = await this._prisma.permission.findUnique({
      where: { id: permissionId, deletedAt: null },
    });

    if (!permission) {
      throw new NotFoundException('الصلاحية غير موجودة');
    }

    const where: Prisma.UserRolePermissionWhereInput = {
      permissionId,
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this._prisma.userRolePermission.findMany({
        where,
        select: selectUserRolePermissionValidator(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this._prisma.userRolePermission.count({ where }),
    ]);

    return { data, count: total };
  }
}