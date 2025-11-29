import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintFilterDto } from '../dtos/complaint-filter.dto';
import { FindAllComplaintDto } from '../dtos/find-all-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';

@Injectable()
export class ComplaintGetterService {
  constructor(private readonly _prisma: PrismaService) {}

  // ✅ Helper function لتحويل JSON strings لـ arrays
  private parseComplaintData(complaint: any) {
    if (!complaint) return null;

    return {
      ...complaint,
      images: this.parseJsonField(complaint.images),
      documents: this.parseJsonField(complaint.documents),
    };
  }

  private parseJsonField(field: string | null | undefined): string[] {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async findMyComplaints(
    userId: number,
    pagination: PaginationDto,
    filter?: ComplaintFilterDto,
  ): Promise<FindAllComplaintDto> {
    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 10;

    const where: any = {
      userId,
      deletedAt: null,
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
        select: selectComplaintValidator(),
      }),
      this._prisma.complaint.count({ where }),
    ]);

    // ✅ تحويل كل الشكاوى
    const parsedData = data.map((complaint) => this.parseComplaintData(complaint));

    return new FindAllComplaintDto(count, parsedData);
  }

  async findAll(
    pagination: PaginationDto,
    filter?: ComplaintFilterDto,
  ): Promise<FindAllComplaintDto> {
    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 10;

    const where: any = {
      deletedAt: null,
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
        select: selectComplaintValidator(),
      }),
      this._prisma.complaint.count({ where }),
    ]);

    // ✅ تحويل كل الشكاوى
    const parsedData = data.map((complaint) => this.parseComplaintData(complaint));

    return new FindAllComplaintDto(count, parsedData);
  }

  async findOne(id: number) {
    const complaint = await this._prisma.complaint.findUniqueOrThrow({
      where: { id, deletedAt: null },
      select: selectComplaintValidator(),
    });

    // ✅ تحويل البيانات
    return this.parseComplaintData(complaint);
  }

  async findByGovernmentName(
    governmentName: string,
    pagination: PaginationDto,
  ): Promise<FindAllComplaintDto> {
    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 10;

    const government = await this._prisma.government.findUnique({
      where: { name: governmentName },
    });

    if (!government) {
      return new FindAllComplaintDto(0, []);
    }

    const where = { governmentId: government.id, deletedAt: null };

    const [data, count] = await Promise.all([
      this._prisma.complaint.findMany({
        where,
        skip,
        take,
        select: selectComplaintValidator(),
      }),
      this._prisma.complaint.count({ where }),
    ]);

    // ✅ تحويل كل الشكاوى
    const parsedData = data.map((complaint) => this.parseComplaintData(complaint));

    return new FindAllComplaintDto(count, parsedData);
  }
}