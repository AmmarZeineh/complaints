// services/complaintNote-deleter.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { ComplaintNoteRepository } from '../repositories/complaintNote.repository';

@Injectable()
export class ComplaintNoteDeleterService {
  constructor(private readonly _repository: ComplaintNoteRepository) {}

  async delete(id: number, userId: number) {
    // 1. التحقق من وجود الملاحظة
    const existingNote = await this._repository.findById(id);

    if (!existingNote) {
      throw new NotFoundException('الملاحظة غير موجودة');
    }

    // 2. التحقق من صلاحية الحذف
    if (existingNote.userId !== userId) {
      throw new ForbiddenException('لا تملك صلاحية حذف هذه الملاحظة');
    }

    // 3. الحذف
    await this._repository.softDelete(id);

    return { success: true };
  }
}