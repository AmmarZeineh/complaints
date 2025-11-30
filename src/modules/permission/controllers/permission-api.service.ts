import { Injectable } from '@nestjs/common';
import { PermissionCreatorService } from '../services/permission-creator.service';
import { PermissionGetterService } from '../services/permission-getter.service';
import { PermissionUpdaterService } from '../services/permission-updater.service';
import { PermissionDeleterService } from '../services/permission-deleter.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { PermissionDto } from '../dtos/permission.dto';
import { FindAllPermissionDto } from '../dtos/find-all-permission.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { PermissionFilterDto } from '../dtos/permission-filter.dto';

@Injectable()
export class PermissionApiService {
  constructor(
    private readonly _creator: PermissionCreatorService,
    private readonly _getter: PermissionGetterService,
    private readonly _updater: PermissionUpdaterService,
    private readonly _deleter: PermissionDeleterService,
  ) {}

  async create(dto: CreatePermissionDto): Promise<PermissionDto> {
    const raw = await this._creator.create(dto);
    return new PermissionDto(raw);
  }

  async findOne(id: number): Promise<PermissionDto> {
    const raw = await this._getter.findById(id);
    return new PermissionDto(raw);
  }

  async findAll(
    pagination: PaginationDto,
    filter?: PermissionFilterDto,
  ): Promise<FindAllPermissionDto> {
    const result = await this._getter.findAll(pagination, filter);
    return new FindAllPermissionDto(result.count, result.data);
  }

  async update(id: number, dto: UpdatePermissionDto): Promise<PermissionDto> {
    const raw = await this._updater.update(id, dto);
    return new PermissionDto(raw);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this._deleter.delete(id);
    return { message: 'تم حذف الصلاحية بنجاح' };
  }
}