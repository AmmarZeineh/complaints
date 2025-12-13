import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { selectRoleValidator } from '../validators/select-role-validator';

@Injectable()
export class RoleCreatorService {
  constructor(private readonly _prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    // التحقق من عدم وجود دور بنفس الاسم
    const existing = await this._prisma.userRole.findFirst({
      where: {
        name: dto.name,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('يوجد دور بنفس الاسم بالفعل');
    }

    return await this._prisma.userRole.create({
      data: {
        name: dto.name,
      },
      select: selectRoleValidator(),
    });
  }
}