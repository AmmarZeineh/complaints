// modules/complaintHistory/services/complaintHistory-export.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ComplaintHistoryExportService {
  constructor(private readonly _prisma: PrismaService) {}

  /**
   * تصدير تقرير كامل عن الشكوى بصيغة PDF
   */
  async exportComplaintReport(complaintId: number): Promise<Buffer> {
    // 1. جلب بيانات الشكوى الكاملة
    const complaint = await this._prisma.complaint.findUnique({
      where: { id: complaintId, deletedAt: null },
      select: {
        id: true,
        type: true,
        description: true,
        Location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        images: true,
        documents: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        government: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    // 2. جلب السجل الزمني
    const history = await this._prisma.complaintHistory.findMany({
      where: { complaintId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        action: true,
        description: true,
        oldValue: true,
        newValue: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 3. جلب الإحصائيات
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

    // 4. إنشاء PDF
    return this.generatePDF({
      complaint,
      history,
      statistics: { totalEvents, statusChanges, interactions, notes },
    });
  }

  /**
   * توليد ملف PDF
   */
  private async generatePDF(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `تقرير الشكوى رقم ${data.complaint.id}`,
          Author: 'نظام الشكاوى',
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        // ملاحظة: لدعم العربية بشكل كامل، يجب تحميل خط عربي
        // doc.font('fonts/Cairo-Regular.ttf');

        // العنوان الرئيسي
        doc
          .fontSize(24)
          .text(`Complaint Report #${data.complaint.id}`, { align: 'center' });

        doc.moveDown(2);

        // معلومات الشكوى الأساسية
        doc.fontSize(16).text('Complaint Information', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12);
        doc.text(`Type: ${data.complaint.type}`);
        doc.text(`Status: ${this.translateStatus(data.complaint.status)}`);
        doc.text(`Location: ${data.complaint.Location}`);
        doc.text(`Government: ${data.complaint.government.name}`);
        doc.text(`Created: ${this.formatDate(data.complaint.createdAt)}`);
        doc.text(`Last Updated: ${this.formatDate(data.complaint.updatedAt)}`);

        doc.moveDown();
        doc.text('Description:', { continued: false });
        doc.text(data.complaint.description, { width: 500 });

        doc.moveDown(2);

        // معلومات المواطن
        doc.fontSize(16).text('Citizen Information', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12);
        doc.text(`Name: ${data.complaint.user.name}`);
        doc.text(`Email: ${data.complaint.user.email}`);

        doc.moveDown(2);

        // الإحصائيات
        doc.fontSize(16).text('Statistics', { underline: true });
        doc.moveDown(0.5);

        doc.fontSize(12);
        doc.text(`Total Events: ${data.statistics.totalEvents}`);
        doc.text(`Status Changes: ${data.statistics.statusChanges}`);
        doc.text(`Interactions: ${data.statistics.interactions}`);
        doc.text(`Notes: ${data.statistics.notes}`);

        doc.addPage();

        // السجل الزمني
        doc.fontSize(16).text('Timeline', { underline: true });
        doc.moveDown(1);

        data.history.forEach((event: any, index: number) => {
          doc.fontSize(11);
          doc.text(`${index + 1}. ${event.description}`, { continued: true });
          doc.fontSize(9);
          doc.text(` - ${this.formatDate(event.createdAt)}`, { align: 'left' });

          if (event.user) {
            doc.fontSize(9);
            // ✅ تصحيح: استخدام fillColor بدلاً من color
            doc.fillColor('gray').text(`   By: ${event.user.name}`);
            // إعادة اللون للأسود للنص التالي
            doc.fillColor('black');
          }

          doc.moveDown(0.5);

          // إضافة صفحة جديدة إذا اقتربنا من نهاية الصفحة
          if (doc.y > 700) {
            doc.addPage();
          }
        });

        // التذييل
        doc.fontSize(8).text(
          `Report generated on: ${this.formatDate(new Date())}`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * ترجمة الحالة
   */
  private translateStatus(status: string): string {
    const translations: Record<string, string> = {
      NEW: 'New',
      INPROCESS: 'In Process',
      COMPLETED: 'Completed',
      REJECTED: 'Rejected',
    };
    return translations[status] || status;
  }

  /**
   * تنسيق التاريخ
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}