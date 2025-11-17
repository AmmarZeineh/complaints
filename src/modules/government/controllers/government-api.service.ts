import { Injectable } from '@nestjs/common';
import { CreateGovernmentDto } from '../dtos/create-government.dto';
import { UpdateGovernmentDto } from '../dtos/update-government.dto';
import { GovernmentCreatorService } from '../services/government-creator.service';
import { GovernmentGetterService } from '../services/government-getter.service';
import { GovernmentUpdaterService } from '../services/government-updater.service';
import { GovernmentDeleteService } from '../services/government-delete.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { GovernmentFilterDto } from '../dtos/government-filter.dto';
import { GovernmentDto } from '../dtos/government.dto';
import { FindAllGovernmentDto } from '../dtos/find-all-government.dto';

@Injectable()
export class GovernmentApiService {
  constructor(
    private readonly _creator: GovernmentCreatorService,
    private readonly _getter: GovernmentGetterService,
    private readonly _updater: GovernmentUpdaterService,
    private readonly _deleter: GovernmentDeleteService,
  ) {}

  async create(dto: CreateGovernmentDto): Promise<GovernmentDto> {
    const raw = await this._creator.create(dto);
    return new GovernmentDto(raw);
  }

  async findOne(id: number): Promise<GovernmentDto> {
    const raw = await this._getter.findById(id);
    return new GovernmentDto(raw);
  }

  async findAll(
    pagination: PaginationDto,
    filter?: GovernmentFilterDto,
  ): Promise<FindAllGovernmentDto> {
    return await this._getter.findAll(pagination, filter);
  }

  async update(id: number, dto: UpdateGovernmentDto): Promise<GovernmentDto> {
    const raw = await this._updater.update(id, dto);
    return new GovernmentDto(raw);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this._deleter.delete(id);
    return { message: 'Government deleted successfully' };
  }
}
