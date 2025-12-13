import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({
    description: 'معرف الدور',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'اسم الدور',
    example: 'موظف حكومي',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'الصلاحيات المرتبطة بالدور',
    example: [
      { id: 1, name: 'CREATE_COMPLAINT' },
      { id: 2, name: 'READ_COMPLAINT' },
    ],
  })
  permissions?: {
    id: number;
    name: string;
  }[];

  @ApiPropertyOptional({
    description: 'عدد المستخدمين في هذا الدور',
    example: 5,
  })
  usersCount?: number;

  @ApiProperty({
    description: 'تاريخ الإنشاء',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'تاريخ آخر تحديث',
  })
  updatedAt: Date;

  constructor(raw: RawRole) {
    if (!raw) return;

    this.id = raw.id;
    this.name = raw.name;
    this.createdAt = raw.createdAt;
    this.updatedAt = raw.updatedAt;

    if (raw.rolePermissions) {
      this.permissions = raw.rolePermissions
        .filter(rp => rp.permission && rp.deletedAt === null)
        .map(rp => ({
          id: rp.permission!.id,
          name: rp.permission!.name,
        }));
    }

    if (raw._count?.users !== undefined) {
      this.usersCount = raw._count.users;
    }
  }
}

export type RawRole = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  rolePermissions?: {
    id: number;
    permissionId: number;
    deletedAt: Date | null;
    permission?: {
      id: number;
      name: string;
    };
  }[];
  _count?: {
    users: number;
  };
};