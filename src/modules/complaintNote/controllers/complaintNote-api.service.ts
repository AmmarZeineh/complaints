// controllers/complaintNote-api.service.ts
import { Injectable } from '@nestjs/common';
import { ComplaintNoteCreatorService } from '../services/complaintNote-creator.service';
import { ComplaintNoteGetterService } from '../services/complaintNote-getter.service';
import { ComplaintNoteUpdaterService } from '../services/complaintNote-updater.service';
import { ComplaintNoteDeleterService } from '../services/complaintNote-deleter.service';
import { CreateComplaintNoteDto } from '../dtos/create-complaintNote.dto';
import { UpdateComplaintNoteDto } from '../dtos/update-complaintNote.dto';
import { ComplaintNoteDto } from '../dtos/complaintNote.dto';
import { FindAllComplaintNoteDto } from '../dtos/find-all-complaintNote.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintNoteFilterDto } from '../dtos/complaintNote-filter.dto';

@Injectable()
export class ComplaintNoteApiService {
  constructor(
    private readonly _creator: ComplaintNoteCreatorService,
    private readonly _getter: ComplaintNoteGetterService,
    private readonly _updater: ComplaintNoteUpdaterService,
    private readonly _deleter: ComplaintNoteDeleterService,
  ) {}

  async create(
    dto: CreateComplaintNoteDto,
    userId: number,
    userGovernmentId: number | null,
  ): Promise<ComplaintNoteDto> {
    const raw = await this._creator.create(dto, userId, userGovernmentId);
    return new ComplaintNoteDto(raw);
  }

  async findOne(id: number): Promise<ComplaintNoteDto> {
    const raw = await this._getter.findById(id);
    return new ComplaintNoteDto(raw);
  }

  async findAll(
    pagination: PaginationDto,
    filter?: ComplaintNoteFilterDto,
  ): Promise<FindAllComplaintNoteDto> {
    const result = await this._getter.findAll(pagination, filter);
    return new FindAllComplaintNoteDto(result.count, result.data);
  }

//   async findByComplaintId(
//     complaintId: number,
//     pagination: PaginationDto,
//   ): Promise<FindAllComplaintNoteDto> {
//     const result = await this._getter.findByComplaintId(complaintId, pagination);
//     return new FindAllComplaintNoteDto(result.count, result.data);
//   }

  async update(
    id: number,
    dto: UpdateComplaintNoteDto,
    userId: number,
  ): Promise<ComplaintNoteDto> {
    const raw = await this._updater.update(id, dto, userId);
    return new ComplaintNoteDto(raw);
  }

  async delete(id: number, userId: number): Promise<{ message: string }> {
    await this._deleter.delete(id, userId);
    return { message: 'تم حذف الملاحظة بنجاح' };
  }
}