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
      userId, // ← فلتر حسب المستخدم الحالي
    };

    // إضافة البحث إذا وُجد
    if (filter?.search) {
      where.OR = [
        { description: { contains: filter.search } },
        { type: { contains: filter.search } },
      ];
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

    const where = filter?.search
      ? {
          OR: [
            { description: { contains: filter.search } },
            { type: { contains: filter.search } },
          ],
        }
      : {};

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
}
