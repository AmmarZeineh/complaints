// modules/complaintNote/repositories/complaint-note.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { IComplaintNoteRepository } from './complaintNote.repository.interface';
import { selectComplaintNoteValidator } from '../validators/select-complaintNote-validator';

@Injectable()
export class ComplaintNoteRepository implements IComplaintNoteRepository {
  constructor(private readonly _prisma: PrismaService) {}

  async create(data: Prisma.ComplaintNoteCreateInput) {
    return await this._prisma.complaintNote.create({
      data,
      select: selectComplaintNoteValidator(),
    });
  }

  async findById(id: number) {
    return await this._prisma.complaintNote.findUnique({
      where: { id, deletedAt: null },
      select: selectComplaintNoteValidator(),
    });
  }

  async findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.ComplaintNoteWhereInput;
    orderBy?: Prisma.ComplaintNoteOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    
    return await this._prisma.complaintNote.findMany({
      skip,
      take,
      where: {
        ...where,
        deletedAt: null,
      },
      orderBy,
      select: selectComplaintNoteValidator(),
    });
  }

  async count(where?: Prisma.ComplaintNoteWhereInput) {
    return await this._prisma.complaintNote.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  async update(id: number, data: Prisma.ComplaintNoteUpdateInput) {
    return await this._prisma.complaintNote.update({
      where: { id },
      data,
      select: selectComplaintNoteValidator(),
    });
  }

  async softDelete(id: number): Promise<void> {
    await this._prisma.complaintNote.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}