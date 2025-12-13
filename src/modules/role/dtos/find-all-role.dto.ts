import { RoleDto, RawRole } from './role.dto';

export class FindAllRoleDto {
  count: number;
  data: RoleDto[];

  constructor(count: number, raws: RawRole[]) {
    this.count = count;
    this.data = raws.map(raw => new RoleDto(raw));
  }
}