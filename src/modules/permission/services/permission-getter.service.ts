import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { selectPermissionValidator } from '../validators/select-permission-validator';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { PermissionFilterDto } from '../dtos/permission-filter.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PermissionGetterService {
  constructor(private readonly _prisma: PrismaService) {}

  async findById(id: number) {
    const permission = await this._prisma.permission.findUnique({
      where: { id, deletedAt: null },
      select: selectPermissionValidator(),
    });

    if (!permission) {
      throw new NotFoundException('الصلاحية غير موجودة');
    }

    return permission;
  }

  async findAll(
    pagination: PaginationDto,
    filter?: PermissionFilterDto,
  ) {
    const { skip, limit } = pagination;

    const where: Prisma.PermissionWhereInput = {
      deletedAt: null,
      ...(filter?.search && {
        name: { contains: filter.search },
      }),
    };

    const [data, total] = await Promise.all([
      this._prisma.permission.findMany({
        where,
        select: selectPermissionValidator(),
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this._prisma.permission.count({ where }),
    ]);

    return { data, count: total };
  }
}