import { Injectable } from '@nestjs/common';
import { ComplaintCreatorService } from '../services/complaint-creator.service';
import { ComplaintGetterService } from '../services/complaint-getter.service';
import { ComplaintUpdaterService } from '../services/complaint-updater.service';
import { ComplaintDeleteService } from '../services/complaint-delete.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintFilterDto } from '../dtos/complaint-filter.dto';
import { CreateComplaintDto } from '../dtos/create-complaint.dto';
import { ComplaintDto } from '../dtos/complaint.dto';
import { UpdateComplaintDto } from '../dtos/update-complaint.dto';

@Injectable()
export class ComplaintApiService {
  constructor(
    private readonly _creator: ComplaintCreatorService,
    private readonly _getter: ComplaintGetterService,
    private readonly _updater: ComplaintUpdaterService,
    private readonly _deleter: ComplaintDeleteService,
  ) {}

  async create(
  dto: CreateComplaintDto, 
  userId: number, 
  files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] } // ← هنا التعديل
) {
  const raw = await this._creator.create(dto, userId, files); // تمرير الكائن كما هو
  return new ComplaintDto(raw);
}
  async findOne(id: number) {
    const raw = await this._getter.findOne(id);
    return new ComplaintDto(raw);
  }

  async findAll(pagination: PaginationDto, filter?: ComplaintFilterDto) {
    return this._getter.findAll(pagination, filter);
  }

  async update(
    id: number, 
    dto: UpdateComplaintDto, 
    userId: number, 
    files?: Express.Multer.File[]
  ) {
    const raw = await this._updater.update(id, dto, userId, files);
    return new ComplaintDto(raw);
  }

  async delete(id: number) {
    await this._deleter.delete(id);
    return { message: 'Deleted successfully' };
  }

  async findMyComplaints(
    userId: number,
    pagination: PaginationDto,
    filter?: ComplaintFilterDto,
  ) {
    return this._getter.findMyComplaints(userId, pagination, filter);
  }

  async findByGovernmentName(
  governmentName: string,
  pagination: PaginationDto,
  filter?: ComplaintFilterDto,
) {
  return this._getter.findByGovernmentName(governmentName, pagination);
}

}
