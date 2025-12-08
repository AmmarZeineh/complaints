// services/complaintNote-creator.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { CreateComplaintNoteDto } from '../dtos/create-complaintNote.dto';
import { ComplaintNoteRepository } from '../repositories/complaintNote.repository';
import { ComplaintHistoryService } from '../../complaintHistory/services/complaintHistory-creator.service';

@Injectable()
export class ComplaintNoteCreatorService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _repository: ComplaintNoteRepository,
    private readonly historyService: ComplaintHistoryService, // ✅ إضافة
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

    // 3. إنشاء الملاحظة
    const note = await this._repository.create({
      complaint: { connect: { id: dto.complaintId } },
      user: { connect: { id: userId } },
      content: dto.content,
    });

    // ✅ 4. تسجيل في السجل الزمني
    await this.historyService.logNoteAdded(
      dto.complaintId,
      userId,
      note.id,
      dto.content
    );

    return note;
  }
}