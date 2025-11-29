// modules/complaintNote/repositories/complaint-note.repository.interface.ts
import { Prisma } from '@prisma/client';

export interface IComplaintNoteRepository {
  create(data: Prisma.ComplaintNoteCreateInput): Promise<any>;
  
  findById(id: number): Promise<any | null>;
  
  findAll(params: {
    skip: number;
    take: number;
    where?: Prisma.ComplaintNoteWhereInput;
    orderBy?: Prisma.ComplaintNoteOrderByWithRelationInput;
  }): Promise<any[]>;
  
  count(where?: Prisma.ComplaintNoteWhereInput): Promise<number>;
  
  update(id: number, data: Prisma.ComplaintNoteUpdateInput): Promise<any>;
  
  softDelete(id: number): Promise<void>;
}