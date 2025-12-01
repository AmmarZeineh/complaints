import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintFilterDto } from '../dtos/complaint-filter.dto';
import { FindAllComplaintDto } from '../dtos/find-all-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';

@Injectable()
export class ComplaintGetterService {
  constructor(private readonly _prisma: PrismaService) {}

  // ✅ Helper لتحويل JSON strings إلى arrays
  private parseJsonField(field: string | null | undefined): string[] {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // ✅ تحويل شكوى واحدة مع الملفات والتفاعلات
  private async parseComplaintDataWithInteractions(complaint: any) {
    if (!complaint) return null;

    const parsedComplaint = {
      ...complaint,
      images: this.parseJsonField(complaint.images),
      documents: this.parseJsonField(complaint.documents),
    };

    // جلب التفاعلات المرتبطة بالشكوى
    const interactions = await this._prisma.complaintInteraction.findMany({
      where: { complaintId: complaint.id },
    });

    const parsedInteractions = interactions.map((i) => ({
      ...i,
      images: this.parseJsonField(i.images),
      documents: this.parseJsonField(i.documents),
    }));

    return {
      ...parsedComplaint,
      interactions: parsedInteractions,
    };
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

    const parsedData = await Promise.all(
      data.map((complaint) =>
        this.parseComplaintDataWithInteractions(complaint),
      ),
    );

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

    const parsedData = await Promise.all(
      data.map((complaint) =>
        this.parseComplaintDataWithInteractions(complaint),
      ),
    );

    return new FindAllComplaintDto(count, parsedData);
  }

  async findOne(id: number) {
    const complaint = await this._prisma.complaint.findUniqueOrThrow({
      where: { id, deletedAt: null },
      select: selectComplaintValidator(),
    });

    return this.parseComplaintDataWithInteractions(complaint);
  }

  async findByGovernmentId(
    governmentId: number,
    pagination: PaginationDto,
  ): Promise<FindAllComplaintDto> {
    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 10;

    const where = { governmentId, deletedAt: null };

    const [data, count] = await Promise.all([
      this._prisma.complaint.findMany({
        where,
        skip,
        take,
        select: selectComplaintValidator(),
      }),
      this._prisma.complaint.count({ where }),
    ]);

    const parsedData = await Promise.all(
      data.map((complaint) =>
        this.parseComplaintDataWithInteractions(complaint),
      ),
    );

    return new FindAllComplaintDto(count, parsedData);
  }
}
