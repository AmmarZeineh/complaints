import { Injectable } from '@nestjs/common';
import { UserRolePermissionCreatorService } from '../services/userRolePermission-creator.service';
import { UserRolePermissionGetterService } from '../services/userRolePermission-getter.service';
import { UserRolePermissionDeleterService } from '../services/userRolePermission-deleter.service';
import { AssignPermissionsDto } from '../dtos/assign-permission.dto';
import { UserRolePermissionDto } from '../dtos/userRolePermission.dto';
import { FindAllUserRolePermissionDto } from '../dtos/find-all-userRolePermission.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';

@Injectable()
export class UserRolePermissionApiService {
  constructor(
    private readonly _creator: UserRolePermissionCreatorService,
    private readonly _getter: UserRolePermissionGetterService,
    private readonly _deleter: UserRolePermissionDeleterService,
  ) {}

  // async assign(dto: AssignPermissionDto): Promise<UserRolePermissionDto> {
  //   const raw = await this._creator.assign(dto);
  //   return new UserRolePermissionDto(raw);
  // }

async assignMultiple(dto: AssignPermissionsDto): Promise<UserRolePermissionDto> {
  const result = await this._creator.assignMultiple(dto);

  return new UserRolePermissionDto(result.data);
}



  async findOne(id: number): Promise<UserRolePermissionDto> {
    const raw = await this._getter.findById(id);
    return new UserRolePermissionDto([raw]);
  }

  async findAll(pagination: PaginationDto): Promise<FindAllUserRolePermissionDto> {
    const result = await this._getter.findAll(pagination);
    return new FindAllUserRolePermissionDto(result.count, result.data);
  }

  async findByUserRoleId(
    userRoleId: number,
    pagination: PaginationDto,
  ): Promise<FindAllUserRolePermissionDto> {
    const result = await this._getter.findByUserRoleId(userRoleId, pagination);
    return new FindAllUserRolePermissionDto(result.count, result.data);
  }

  async findByPermissionId(
    permissionId: number,
    pagination: PaginationDto,
  ): Promise<FindAllUserRolePermissionDto> {
    const result = await this._getter.findByPermissionId(permissionId, pagination);
    return new FindAllUserRolePermissionDto(result.count, result.data);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this._deleter.delete(id);
    return { message: 'تم حذف الربط بنجاح' };
  }

  async removePermissionFromRole(
    userRoleId: number,
    permissionId: number,
  ): Promise<{ message: string }> {
    await this._deleter.removePermissionFromRole(userRoleId, permissionId);
    return { message: 'تم إلغاء الصلاحية من الدور بنجاح' };
  }
}