// modules/complaint/services/complaint-history.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { HistoryAction } from '@prisma/client';

interface CreateHistoryParams {
  complaintId: number;
  userId: number;
  action: HistoryAction;
  oldValue?: any;
  newValue?: any;
  description: string;
  metadata?: any;
}

@Injectable()
export class ComplaintHistoryService {
  constructor(private readonly _prisma: PrismaService) {}

  /**
   * تسجيل حدث في السجل الزمني
   */
  async createHistoryEntry(params: CreateHistoryParams) {
    const { complaintId, userId, action, oldValue, newValue, description, metadata } = params;

    return await this._prisma.complaintHistory.create({
      data: {
        complaintId,
        userId,
        action,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        description,
        metadata: metadata || null,
      },
    });
  }

  /**
   * تسجيل إنشاء الشكوى
   */
  async logComplaintCreated(complaintId: number, userId: number, complaintData: any) {
    return this.createHistoryEntry({
      complaintId,
      userId,
      action: 'COMPLAINT_CREATED',
      newValue: {
        type: complaintData.type,
        description: complaintData.description,
        location: complaintData.Location,
        governmentId: complaintData.governmentId,
      },
      description: 'تم إنشاء الشكوى',
    });
  }

  /**
   * تسجيل تعديل الشكوى
   */
  async logComplaintUpdated(
    complaintId: number,
    userId: number,
    oldData: any,
    newData: any,
  ) {
    const changes: string[] = [];
    
    if (oldData.description !== newData.description) changes.push('الوصف');
    if (oldData.Location !== newData.Location) changes.push('الموقع');
    if (oldData.type !== newData.type) changes.push('النوع');

    return this.createHistoryEntry({
      complaintId,
      userId,
      action: 'COMPLAINT_UPDATED',
      oldValue: {
        description: oldData.description,
        location: oldData.Location,
        type: oldData.type,
      },
      newValue: {
        description: newData.description,
        location: newData.Location,
        type: newData.type,
      },
      description: `تم تعديل: ${changes.join('، ')}`,
    });
  }

  /**
   * تسجيل حجز الشكوى
   */
  async logComplaintAssigned(
    complaintId: number,
    employeeId: number,
    employeeName: string,
  ) {
    return this.createHistoryEntry({
      complaintId,
      userId: employeeId,
      action: 'COMPLAINT_ASSIGNED',
      newValue: { employeeId, employeeName },
      description: `تم حجز الشكوى بواسطة ${employeeName}`,
    });
  }

  /**
   * تسجيل تغيير الحالة
   */
  async logStatusChanged(
    complaintId: number,
    userId: number,
    oldStatus: string,
    newStatus: string,
  ) {
    const statusTranslations: Record<string, string> = {
      NEW: 'جديدة',
      INPROCESS: 'قيد المعالجة',
      COMPLETED: 'مكتملة',
      REJECTED: 'مرفوضة',
    };

    return this.createHistoryEntry({
      complaintId,
      userId,
      action: 'STATUS_CHANGED',
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      description: `تم تغيير الحالة من "${statusTranslations[oldStatus]}" إلى "${statusTranslations[newStatus]}"`,
    });
  }

  /**
   * تسجيل إضافة ملاحظة
   */
  async logNoteAdded(
    complaintId: number,
    userId: number,
    noteId: number,
    noteContent: string,
  ) {
    return this.createHistoryEntry({
      complaintId,
      userId,
      action: 'NOTE_ADDED',
      newValue: { noteContent: noteContent.substring(0, 100) + '...' },
      description: 'تم إضافة ملاحظة جديدة',
      metadata: { noteId },
    });
  }

  /**
   * تسجيل إنشاء تفاعل
   */
  async logInteractionCreated(
    complaintId: number,
    userId: number,
    interactionId: number,
    interactionType: string,
    message: string,
  ) {
    const typeTranslations: Record<string, string> = {
      REQUEST_INFO: 'طلب معلومات إضافية',
      CITIZEN_RESPONSE: 'رد المواطن',
    };

    return this.createHistoryEntry({
      complaintId,
      userId,
      action: 'INTERACTION_CREATED',
      newValue: {
        type: interactionType,
        message: message.substring(0, 100) + '...',
      },
      description: typeTranslations[interactionType] || 'تم إضافة تفاعل',
      metadata: { interactionId },
    });
  }

  /**
   * تسجيل حذف الشكوى
   */
  async logComplaintDeleted(complaintId: number, userId: number) {
    return this.createHistoryEntry({
      complaintId,
      userId,
      action: 'COMPLAINT_DELETED',
      description: 'تم حذف الشكوى',
    });
  }
}