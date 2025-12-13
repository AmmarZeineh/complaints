import { Injectable } from '@nestjs/common';
import { RoleCreatorService } from '../services/role-creator.service';
import { RoleGetterService } from '../services/role-getter.service';
import { RoleUpdaterService } from '../services/role-updater.service';
import { RoleDeleterService } from '../services/role-deleter.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { RoleDto } from '../dtos/role.dto';
import { FindAllRoleDto } from '../dtos/find-all-role.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';

@Injectable()
export class RoleApiService {
  constructor(
    private readonly _creator: RoleCreatorService,
    private readonly _getter: RoleGetterService,
    private readonly _updater: RoleUpdaterService,
    private readonly _deleter: RoleDeleterService,
  ) {}

  async create(dto: CreateRoleDto): Promise<RoleDto> {
    const raw = await this._creator.create(dto);
    return new RoleDto(raw);
  }

  async findOne(id: number): Promise<RoleDto> {
    const raw = await this._getter.findById(id);
    return new RoleDto(raw);
  }

  async findAll(pagination: PaginationDto): Promise<FindAllRoleDto> {
    const result = await this._getter.findAll(pagination);
    return new FindAllRoleDto(result.count, result.data);
  }

  async update(id: number, dto: UpdateRoleDto): Promise<RoleDto> {
    const raw = await this._updater.update(id, dto);
    return new RoleDto(raw);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this._deleter.delete(id);
    return { message: 'تم حذف الدور بنجاح' };
  }

  async findOneWithPermissions(id: number): Promise<RoleDto> {
    const raw = await this._getter.findByIdWithPermissions(id);
    return new RoleDto(raw);
  }
}