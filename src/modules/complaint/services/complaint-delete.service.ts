// modules/complaint/services/complaint-delete.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { ComplaintHistoryService } from '../../complaintHistory/services/complaintHistory-creator.service';

@Injectable()
export class ComplaintDeleteService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly historyService: ComplaintHistoryService,
  ) {}

  async delete(id: number, userId?: number) {
    const complaint = await this._prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    // ✅ تسجيل الحذف قبل الحذف الفعلي
    if (userId) {
      await this.historyService.logComplaintDeleted(id, userId);
    }

    // Soft delete
    await this._prisma.complaint.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}