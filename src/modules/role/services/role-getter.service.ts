import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import {
  selectRoleValidator,
  selectRoleWithPermissionsValidator,
} from '../validators/select-role-validator';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoleGetterService {
  constructor(private readonly _prisma: PrismaService) {}

  async findById(id: number) {
    const role = await this._prisma.userRole.findUnique({
      where: { id, deletedAt: null },
      select: selectRoleValidator(),
    });

    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    return role;
  }

  async findByIdWithPermissions(id: number) {
    const role = await this._prisma.userRole.findUnique({
      where: { id, deletedAt: null },
      select: selectRoleWithPermissionsValidator(),
    });

    if (!role) {
      throw new NotFoundException('الدور غير موجود');
    }

    return role;
  }

  async findAll(pagination: PaginationDto) {
    const { skip, limit } = pagination;

    const where: Prisma.UserRoleWhereInput = {
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this._prisma.userRole.findMany({
        where,
        select: selectRoleWithPermissionsValidator(),
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this._prisma.userRole.count({ where }),
    ]);

    return { data, count: total };
  }
}