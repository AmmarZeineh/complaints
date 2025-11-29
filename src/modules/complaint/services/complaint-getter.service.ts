import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintFilterDto } from '../dtos/complaint-filter.dto';
import { FindAllComplaintDto } from '../dtos/find-all-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';

@Injectable()
export class ComplaintGetterService {
  constructor(private readonly _prisma: PrismaService) {}

    async findMyComplaints(
    userId: number,
    pagination: PaginationDto,
    filter?: ComplaintFilterDto,
  ): Promise<FindAllComplaintDto> {
    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 10;

  const where: any = {
  userId,
};

if (filter?.search) {
  where.OR = [
    { description: { contains: filter.search } },
    { type: { contains: filter.search } },
  ];
}

if (filter?.status) {
  where.status = filter.status;
}


    const [data, count] = await Promise.all([
      this._prisma.complaint.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }, // ← الأحدث أولاً
        select: selectComplaintValidator(),
      }),
      this._prisma.complaint.count({ where }),
    ]);

    return new FindAllComplaintDto(count, data);
  }

  async findAll(
    pagination: PaginationDto,
    filter?: ComplaintFilterDto,
  ): Promise<FindAllComplaintDto> {
    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 10;

  const where: any = {};

if (filter?.search) {
  where.OR = [
    { description: { contains: filter.search } },
    { type: { contains: filter.search } },
  ];
}

if (filter?.status) {
  where.status = filter.status;
}

    const [data, count] = await Promise.all([
      this._prisma.complaint.findMany({
        where,
        skip,
        take,
        select: selectComplaintValidator(),
      }),
      this._prisma.complaint.count({ where }),
    ]);
    return new FindAllComplaintDto(count, data);
  }

  async findOne(id: number) {
    return this._prisma.complaint.findUniqueOrThrow({
      where: { id },
      select: selectComplaintValidator(),
    });
  }

 async findByGovernmentId(
  governmentId: number,
  pagination: PaginationDto,
): Promise<FindAllComplaintDto> {
  const skip = Math.max(pagination.skip ?? 0, 0);
  const take = pagination.limit ?? 10;


  const where = { governmentId: governmentId, deletedAt: null };

  const [data, count] = await Promise.all([
    this._prisma.complaint.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: selectComplaintValidator(),
    }),
    this._prisma.complaint.count({ where }),
  ]);

  return new FindAllComplaintDto(count, data);
}

}
