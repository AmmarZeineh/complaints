import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(raw: RawPermission) {
    this.id = raw.id;
    this.name = raw.name;
    this.createdAt = raw.createdAt;
    this.updatedAt = raw.updatedAt;
  }
}

export type RawPermission = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};