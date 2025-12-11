import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { ComplaintHistoryPdfService } from './complaintHistory-pdf.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

export interface ExportResult {
  fileName: string;
  filePath: string;
  fileSize: string;
  fileSizeBytes: number;
  recordsCount: number;
  generatedAt: string;
  downloadUrl?: string; // اختياري
}

@Injectable()
export class ComplaintHistoryExportService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _pdfService: ComplaintHistoryPdfService,
    private readonly _configService: ConfigService,
  ) {}

  /**
   * تصدير السجل الزمني كـ PDF
   */
  async exportComplaintHistoryPDF(complaintId: number): Promise<ExportResult> {
    // 1️⃣ جلب معلومات الشكوى
    const complaint = await this._prisma.complaint.findUnique({
      where: { 
        id: complaintId,
        deletedAt: null, // التأكد من أن الشكوى غير محذوفة
      },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        Location: true,
        user: {
          select: { name: true },
        },
        government: {
          select: { name: true },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundException('الشكوى غير موجودة أو تم حذفها');
    }

    // 2️⃣ جلب كل السجل الزمني (بدون pagination)
    const history = await this._prisma.complaintHistory.findMany({
      where: { 
        complaintId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
        oldValue: true,
        newValue: true,
        metadata: true,
        user: {
          select: { name: true },
        },
      },
    });

    if (history.length === 0) {
      throw new NotFoundException('لا يوجد سجل زمني لهذه الشكوى');
    }

    // 3️⃣ إثراء البيانات بالتفاعلات والملاحظات
    const enrichedHistory = await Promise.all(
      history.map(async (item) => {
        // إذا كان تفاعل
        if (
          item.action === 'INTERACTION_CREATED' &&
          item.metadata &&
          typeof item.metadata === 'object' &&
          'interactionId' in item.metadata
        ) {
          const interactionId = (item.metadata as any).interactionId;
          const interaction = await this._prisma.complaintInteraction.findUnique({
            where: { 
              id: interactionId,
              deletedAt: null,
            },
            select: {
              message: true,
              images: true,
              documents: true,
            },
          });

          if (interaction) {
            return {
              ...item,
              interaction: {
                message: interaction.message,
                images: this.parseJsonField(interaction.images),
                documents: this.parseJsonField(interaction.documents),
              },
            };
          }
        }

        // إذا كان ملاحظة
        if (
          item.action === 'NOTE_ADDED' &&
          item.metadata &&
          typeof item.metadata === 'object' &&
          'noteId' in item.metadata
        ) {
          const noteId = (item.metadata as any).noteId;
          const note = await this._prisma.complaintNote.findUnique({
            where: { 
              id: noteId,
              deletedAt: null,
            },
            select: { content: true },
          });

          if (note) {
            return {
              ...item,
              note: { content: note.content },
            };
          }
        }

        return item;
      }),
    );

    // 4️⃣ توليد PDF
    const fileName = await this._pdfService.generateComplaintHistoryPDF(
      {
        id: complaint.id,
        type: complaint.type,
        status: complaint.status,
        createdAt: complaint.createdAt,
        userName: complaint.user.name,
        governmentName: complaint.government.name,
        location: complaint.Location,
      },
      enrichedHistory,
    );

    // 5️⃣ إرجاع معلومات الملف
    const filePath = path.join(process.cwd(), 'uploads', 'exports', fileName);
    const fileSize = this._pdfService.getFileSize(filePath);
    const stats = fs.statSync(filePath);
    const baseUrl = this._configService.get<string>('BASE_URL') || 'http://localhost:3000';

    return {
      fileName,
      filePath,
      fileSize,
      fileSizeBytes: stats.size,
      recordsCount: history.length,
      generatedAt: new Date().toISOString(),
      downloadUrl: `${baseUrl}/uploads/exports/${fileName}`, // اختياري
    };
  }

  /**
   * تنظيف الملفات القديمة
   */
  async cleanupOldFiles(olderThanHours: number = 24): Promise<number> {
    const uploadsPath = path.join(process.cwd(), 'uploads', 'exports');
    
    if (!fs.existsSync(uploadsPath)) {
      return 0;
    }

    const files = fs.readdirSync(uploadsPath);
    const now = Date.now();
    const maxAge = olderThanHours * 60 * 60 * 1000;
    let deletedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(uploadsPath, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete file ${file}:`, error);
        }
      }
    });

    return deletedCount;
  }

  /**
   * Helper لتحويل JSON strings
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