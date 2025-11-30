// services/complaintNote-creator.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { CreateComplaintNoteDto } from '../dtos/create-complaintNote.dto';
import { ComplaintNoteRepository } from '../repositories/complaintNote.repository';

@Injectable()
export class ComplaintNoteCreatorService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _repository: ComplaintNoteRepository,
  ) {}

  async create(dto: CreateComplaintNoteDto, userId: number, userGovernmentId: number | null) {
    // 1. التحقق من وجود الشكوى
    const complaint = await this._prisma.complaint.findUnique({
      where: { id: dto.complaintId },
      select: {
        id: true,
        governmentId: true,
        deletedAt: true,
      },
    });

    if (!complaint || complaint.deletedAt) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    // 2. التحقق من صلاحية الموظف
    if (!userGovernmentId) {
      throw new ForbiddenException('يجب أن تكون موظفاً في جهة حكومية لإضافة ملاحظات');
    }

    if (userGovernmentId !== complaint.governmentId) {
      throw new ForbiddenException('لا تملك صلاحية إضافة ملاحظات لهذه الشكوى');
    }

    // 3. إنشاء الملاحظة باستخدام Repository
    return await this._repository.create({
      complaint: { connect: { id: dto.complaintId } },
      user: { connect: { id: userId } },
      content: dto.content,
    });
  }
}