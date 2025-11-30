import { UserRolePermissionDto, RawUserRolePermission } from './userRolePermission.dto';

export class FindAllUserRolePermissionDto {
  count: number;
  data: UserRolePermissionDto[];

  constructor(count: number, raws: RawUserRolePermission[]) {
    this.count = count;

    const map = new Map<number, RawUserRolePermission[]>();

    for (const raw of raws) {
      if (!map.has(raw.userRoleId)) {
        map.set(raw.userRoleId, []);
      }

      map.get(raw.userRoleId)!.push(raw);
    }

    this.data = Array.from(map.values()).map(
      group => new UserRolePermissionDto(group)
    );
  }
}
