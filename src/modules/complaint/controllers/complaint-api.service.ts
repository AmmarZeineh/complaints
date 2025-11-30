import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ComplaintCreatorService } from '../services/complaint-creator.service';
import { ComplaintGetterService } from '../services/complaint-getter.service';
import { ComplaintUpdaterService } from '../services/complaint-updater.service';
import { ComplaintDeleteService } from '../services/complaint-delete.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintFilterDto } from '../dtos/complaint-filter.dto';
import { CreateComplaintDto } from '../dtos/create-complaint.dto';
import { ComplaintDto } from '../dtos/complaint.dto';
import { UpdateComplaintDto } from '../dtos/update-complaint.dto';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class ComplaintApiService {
  constructor(
    private readonly _creator: ComplaintCreatorService,
    private readonly _getter: ComplaintGetterService,
    private readonly _updater: ComplaintUpdaterService,
    private readonly _deleter: ComplaintDeleteService,
    private readonly _prisma: PrismaService,
  ) {}

  async create(
  dto: CreateComplaintDto, 
  userId: number, 
  files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] } 
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
  files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] }
) {
  const complaint = await this._prisma.complaint.findUnique({
    where: { id },
    select: { status: true }
  });

  if (!complaint) {
    throw new NotFoundException('Complaint not found');
  }

  if (complaint.status !== 'NEW') {
    throw new BadRequestException(`Cannot update complaint when status is ${complaint.status}`);
  }

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

  async findByGovernmentId(
  governmentId: number,
  pagination: PaginationDto,
) {
  return this._getter.findByGovernmentId(governmentId, pagination);
}

  async assignComplaint(
    complaintId: number,
    employeeId: number
  ) {
    
    return this._updater.assignComplaint(complaintId, employeeId);
  }
  async updateStatus(complaintId: number , status: string) {
    return this._updater.updateStatus(complaintId,status);
  }

}
