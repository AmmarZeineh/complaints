import { PaginationListDto } from 'src/common/response/pagination-list.dto';
import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto, RawPermission } from './permission.dto';

export class FindAllPermissionDto extends PaginationListDto<PermissionDto> {
  @ApiProperty({ type: [PermissionDto] })
  data: PermissionDto[];

  constructor(count: number, raws: RawPermission[]) {
    const permissions = raws.map((raw) => new PermissionDto(raw));
    super(count, permissions);
    this.data = permissions;
  }
}