import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { UpdateComplaintNoteDto } from '../dtos/update-complaintNote.dto';
import { ComplaintNoteRepository } from '../repositories/complaintNote.repository';

@Injectable()
export class ComplaintNoteUpdaterService {
  constructor(private readonly _repository: ComplaintNoteRepository) {}

  async update(id: number, dto: UpdateComplaintNoteDto, userId: number) {
    // 1. التحقق من وجود الملاحظة
    const existingNote = await this._repository.findById(id);

    if (!existingNote) {
      throw new NotFoundException('الملاحظة غير موجودة');
    }

    // 2. التحقق من صلاحية التعديل
    if (existingNote.userId !== userId) {
      throw new ForbiddenException('لا تملك صلاحية تعديل هذه الملاحظة');
    }

    // 3. التحديث
    const updateData: any = {};
    if (dto.content !== undefined) updateData.content = dto.content;

    return await this._repository.update(id, updateData);
  }
}