import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserRolePermissionDto {
  @ApiProperty({
    description: 'معرف الدور'
  })
  userRoleId: number;

  @ApiProperty({
    description: 'مصفوفة معرفات الصلاحيات المرتبطة بالدور',
    example: [1, 2, 3, 4],
    type: [Number]
  })
  permissionIds: number[];

  @ApiPropertyOptional({
    description: 'بيانات الصلاحيات المرتبطة بالدور',
    example: [
      { id: 1, name: 'CREATE_COMPLAINT' },
      { id: 2, name: 'READ_COMPLAINT' }
    ]
  })
  permissions?: {
    id: number;
    name: string;
  }[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'بيانات الدور',
    example: { id: 1, name: 'موظف حكومي' }
  })
  userRole?: {
    id: number;
    name: string;
  };

  constructor(raw: RawUserRolePermission[]) {
    if (!raw || raw.length === 0) return;

    this.userRoleId = raw[0].userRoleId;

    this.permissionIds = raw.map(item => item.permissionId);

    this.permissions = raw
      .filter(item => item.permission)
      .map(item => item.permission!);

    this.createdAt = raw[0].createdAt;
    this.updatedAt = raw[0].updatedAt;
    this.userRole = raw[0].userRole;
  }
}

export type RawUserRolePermission = {
  id: number;
  userRoleId: number;
  permissionId: number;
  createdAt: Date;
  updatedAt: Date;

  userRole?: {
    id: number;
    name: string;
  };

  permission?: {
    id: number;
    name: string;
  };
};
