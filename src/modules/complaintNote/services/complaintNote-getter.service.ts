// services/complaintNote-getter.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintNoteFilterDto } from '../dtos/complaintNote-filter.dto';
import { Prisma } from '@prisma/client';
import { ComplaintNoteRepository } from '../repositories/complaintNote.repository';

@Injectable()
export class ComplaintNoteGetterService {
  constructor(private readonly _repository: ComplaintNoteRepository) {}

  async findById(id: number) {
    const note = await this._repository.findById(id);

    if (!note) {
      throw new NotFoundException('الملاحظة غير موجودة');
    }

    return note;
  }

  async findAll(
    pagination: PaginationDto,
    filter?: ComplaintNoteFilterDto,
  ) {
    const { skip, limit } = pagination;

    const where: Prisma.ComplaintNoteWhereInput = {
      ...(filter?.complaintId && { complaintId: filter.complaintId }),
      ...(filter?.userId && { userId: filter.userId }),
      ...(filter?.search && {
        content: { contains: filter.search },
      }),
    };

    const [data, total] = await Promise.all([
      this._repository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this._repository.count(where),
    ]);

    return { data, count: total };
  }

  async findByComplaintId(complaintId: number, pagination: PaginationDto) {
    const { skip, limit } = pagination;

    const where: Prisma.ComplaintNoteWhereInput = {
      complaintId,
    };

    const [data, total] = await Promise.all([
      this._repository.findAll({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this._repository.count(where),
    ]);

    return { data, count: total };
  }
}