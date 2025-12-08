// modules/complaint/services/complaint-history-getter.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { FindAllComplaintHistoryDto } from '../dtos/find-all-history.dto';

@Injectable()
export class ComplaintHistoryGetterService {
  constructor(private readonly _prisma: PrismaService) {}

  /**
   * جلب السجل الزمني لشكوى محددة
   */
  async getComplaintHistory(
    complaintId: number,
    pagination: PaginationDto,
  ): Promise<FindAllComplaintHistoryDto> {
    // التحقق من وجود الشكوى
    const complaint = await this._prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true },
    });

    if (!complaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 20;

    const where = { complaintId };

    const [data, count] = await Promise.all([
      this._prisma.complaintHistory.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }, // الأحدث أولاً
        select: {
          id: true,
          complaintId: true,
          userId: true,
          action: true,
          oldValue: true,
          newValue: true,
          description: true,
          metadata: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this._prisma.complaintHistory.count({ where }),
    ]);

    // ✅ إضافة الملفات للأحداث التي تحتوي على interactions
    const enrichedData = await Promise.all(
      data.map(async (historyItem) => {
        // إذا كان الحدث تفاعل وله metadata
        if (
          historyItem.action === 'INTERACTION_CREATED' &&
          historyItem.metadata &&
          typeof historyItem.metadata === 'object' &&
          'interactionId' in historyItem.metadata
        ) {
          const interactionId = (historyItem.metadata as any).interactionId;

          // ✅ جلب التفاعل مع الملفات + بيانات كاملة
          const interaction = await this._prisma.complaintInteraction.findUnique({
            where: { id: interactionId },
            select: {
              id: true,
              message: true,
              senderId: true,
              receiverId: true,
              images: true,
              documents: true,
              type: true,
              createdAt: true,
            },
          });

          if (interaction) {
            return {
              ...historyItem,
              interaction: {
                id: interaction.id,
                type: interaction.type,
                message: interaction.message,
                senderId: interaction.senderId,
                receiverId: interaction.receiverId,
                images: this.parseJsonField(interaction.images),
                documents: this.parseJsonField(interaction.documents),
                createdAt: interaction.createdAt,
              },
            };
          }
        }

        // إذا كان الحدث ملاحظة
        if (
          historyItem.action === 'NOTE_ADDED' &&
          historyItem.metadata &&
          typeof historyItem.metadata === 'object' &&
          'noteId' in historyItem.metadata
        ) {
          const noteId = (historyItem.metadata as any).noteId;

          // جلب الملاحظة الكاملة
          const note = await this._prisma.complaintNote.findUnique({
            where: { id: noteId },
            select: {
              id: true,
              content: true,
            },
          });

          if (note) {
            return {
              ...historyItem,
              note: {
                id: note.id,
                content: note.content,
              },
            };
          }
        }

        return historyItem;
      }),
    );

    // ✅ استخدام enrichedData بدلاً من data
    return new FindAllComplaintHistoryDto(count, enrichedData);
  }

  /**
   * جلب إحصائيات السجل الزمني لشكوى
   */
  async getHistoryStats(complaintId: number) {
    const complaint = await this._prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, createdAt: true, updatedAt: true },
    });

    if (!complaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    const [totalEvents, statusChanges, interactions, notes] = await Promise.all([
      this._prisma.complaintHistory.count({ where: { complaintId } }),
      this._prisma.complaintHistory.count({
        where: { complaintId, action: 'STATUS_CHANGED' },
      }),
      this._prisma.complaintHistory.count({
        where: { complaintId, action: 'INTERACTION_CREATED' },
      }),
      this._prisma.complaintHistory.count({
        where: { complaintId, action: 'NOTE_ADDED' },
      }),
    ]);

    return {
      complaintId,
      totalEvents,
      statusChanges,
      interactions,
      notes,
      createdAt: complaint.createdAt,
      lastUpdatedAt: complaint.updatedAt,
    };
  }

  /**
   * Helper لتحويل JSON strings إلى arrays
   */
  private parseJsonField(field: string | null | undefined): string[] {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}