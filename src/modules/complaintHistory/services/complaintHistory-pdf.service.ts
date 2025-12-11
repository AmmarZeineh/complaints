import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { HistoryAction } from '@prisma/client';

interface ComplaintData {
  id: number;
  type: string;
  status: string;
  createdAt: Date;
  userName: string;
  governmentName: string;
  location: string;
}

interface HistoryItem {
  action: HistoryAction;
  description: string;
  createdAt: Date;
  user?: { name: string };
  oldValue?: any;
  newValue?: any;
  interaction?: {
    message: string;
    images: string[];
    documents: string[];
  };
  note?: {
    content: string;
  };
}

@Injectable()
export class ComplaintHistoryPdfService {
  private readonly uploadsPath = path.join(process.cwd(), 'uploads', 'exports');
  private readonly fontPath = path.join(process.cwd(), 'src', 'assets', 'fonts', 'Cairo-Regular.ttf');

  constructor() {
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
  }

  /**
   * إنشاء PDF للسجل الزمني
   */
  async generateComplaintHistoryPDF(
    complaint: ComplaintData,
    history: HistoryItem[],
  ): Promise<string> {
    const fileName = `complaint-history-${complaint.id}-${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsPath, fileName);

    return new Promise((resolve, reject) => {
      try {
        // إنشاء مستند PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          bufferPages: true,
        });

        // Stream للكتابة
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // ✅ تحميل خط عربي إذا كان متوفراً
        if (fs.existsSync(this.fontPath)) {
          doc.font(this.fontPath);
          console.log('✅ تم تحميل خط Cairo بنجاح');
        } else {
          // خط احتياطي: Arial Unicode MS (موجود في Windows)
          const fallbackFont = 'C:/Windows/Fonts/arialuni.ttf';
          if (fs.existsSync(fallbackFont)) {
            doc.font(fallbackFont);
            console.warn('⚠️ استخدام خط Arial Unicode كبديل');
          } else {
            console.warn('⚠️ لم يتم العثور على خط عربي، النص قد لا يظهر بشكل صحيح');
          }
        }

        // رسم الهيدر
        this.drawHeader(doc, complaint);

        // رسم جدول السجل الزمني
        this.drawHistoryTable(doc, history);

        // رسم الفوتر
        this.drawFooter(doc, history);

        // إنهاء المستند
        doc.end();

        // عند الانتهاء من الكتابة
        writeStream.on('finish', () => {
          resolve(fileName);
        });

        writeStream.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * رسم هيدر التقرير
   */
  private drawHeader(doc: PDFKit.PDFDocument, complaint: ComplaintData) {
    const statusTranslations: Record<string, string> = {
      NEW: 'جديدة',
      INPROCESS: 'قيد المعالجة',
      COMPLETED: 'مكتملة',
      REJECTED: 'مرفوضة',
    };

    // خلفية للهيدر
    doc.rect(0, 0, doc.page.width, 150).fill('#f8f9fa');

    // العنوان الرئيسي
    doc
      .fillColor('#1a1a1a')
      .fontSize(24)
      .text('تقرير السجل الزمني للشكوى', 50, 30, { 
        align: 'center',
        width: doc.page.width - 100,
      })
      .moveDown();

    // خط فاصل
    doc
      .strokeColor('#0066cc')
      .lineWidth(2)
      .moveTo(50, 80)
      .lineTo(doc.page.width - 50, 80)
      .stroke();

    // معلومات الشكوى في صندوق
    const startY = 100;
    doc.fillColor('#333333').fontSize(11);
    
    const infoBox = [
      `رقم الشكوى: ${complaint.id}`,
      `نوع الشكوى: ${complaint.type}`,
      `الحالة: ${statusTranslations[complaint.status] || complaint.status}`,
      `الموقع: ${complaint.location}`,
      `اسم المواطن: ${complaint.userName}`,
      `الجهة الحكومية: ${complaint.governmentName}`,
      `تاريخ الإنشاء: ${this.formatDate(complaint.createdAt)}`,
    ];

    let currentY = startY;
    infoBox.forEach((line, index) => {
      doc.text(line, 60, currentY, { 
        width: doc.page.width - 120,
        continued: false 
      });
      currentY += 20;
    });

    doc.moveDown(2);
  }

  /**
   * رسم جدول السجل الزمني
   */
  private drawHistoryTable(doc: PDFKit.PDFDocument, history: HistoryItem[]) {
    const actionTranslations: Record<HistoryAction, string> = {
      COMPLAINT_CREATED: 'إنشاء الشكوى',
      COMPLAINT_UPDATED: 'تعديل الشكوى',
      COMPLAINT_ASSIGNED: 'حجز الشكوى',
      STATUS_CHANGED: 'تغيير الحالة',
      NOTE_ADDED: 'إضافة ملاحظة',
      INTERACTION_CREATED: 'إضافة تفاعل',
      COMPLAINT_DELETED: 'حذف الشكوى',
    };

    // عنوان الجدول
    doc.addPage();
    doc
      .fillColor('#0066cc')
      .fontSize(16)
      .text('السجل الزمني:', 50, 50, { underline: true })
      .moveDown();

    let yPosition = doc.y + 10;
    
    // رسم رأس الجدول
    doc.rect(50, yPosition, doc.page.width - 100, 30).fill('#0066cc');
    doc.fillColor('#ffffff').fontSize(10);
    doc.text('#', 55, yPosition + 8, { width: 30 });
    doc.text('التاريخ', 90, yPosition + 8, { width: 110 });
    doc.text('الإجراء', 205, yPosition + 8, { width: 90 });
    doc.text('التفاصيل', 300, yPosition + 8, { width: 160 });
    doc.text('المستخدم', 465, yPosition + 8, { width: 80 });
    
    yPosition += 35;

    history.forEach((item, index) => {
      // التحقق من المساحة المتبقية
      if (yPosition > doc.page.height - 100) {
        doc.addPage();
        yPosition = 50;
      }

      // خلفية متناوبة للصفوف
      if (index % 2 === 0) {
        doc.rect(50, yPosition, doc.page.width - 100, 50).fill('#f8f9fa');
      }

      doc.fillColor('#333333').fontSize(9);

      // رقم السجل
      doc.text(`${index + 1}`, 55, yPosition + 5, { width: 30 });

      // التاريخ
      doc.text(this.formatDate(item.createdAt), 90, yPosition + 5, { 
        width: 110,
        lineBreak: false,
      });

      // نوع الإجراء
      doc.fillColor('#0066cc').text(
        actionTranslations[item.action] || item.action, 
        205, 
        yPosition + 5, 
        { width: 90 }
      );

      // الوصف
      doc.fillColor('#333333');
      let description = item.description;

      // إضافة تفاصيل إضافية
      if (item.action === 'INTERACTION_CREATED' && item.interaction) {
        const imagesCount = item.interaction.images?.length || 0;
        const docsCount = item.interaction.documents?.length || 0;
        description = item.interaction.message.substring(0, 80) + '...';
        if (imagesCount > 0) description += ` | صور: ${imagesCount}`;
        if (docsCount > 0) description += ` | مستندات: ${docsCount}`;
      }

      if (item.action === 'NOTE_ADDED' && item.note) {
        description = item.note.content.substring(0, 100) + '...';
      }

      doc.text(description, 300, yPosition + 5, { 
        width: 160,
        lineBreak: true,
      });

      // اسم المستخدم
      doc.text(item.user?.name || 'النظام', 465, yPosition + 5, { 
        width: 80,
        lineBreak: false,
      });

      yPosition += 55;

      // خط فاصل
      doc
        .strokeColor('#e0e0e0')
        .lineWidth(0.5)
        .moveTo(50, yPosition)
        .lineTo(doc.page.width - 50, yPosition)
        .stroke();
    });
  }

  /**
   * رسم فوتر التقرير
   */
  private drawFooter(doc: PDFKit.PDFDocument, history: HistoryItem[]) {
    // حساب الإحصائيات
    const totalEvents = history.length;
    const statusChanges = history.filter((h) => h.action === 'STATUS_CHANGED').length;
    const interactions = history.filter((h) => h.action === 'INTERACTION_CREATED').length;
    const notes = history.filter((h) => h.action === 'NOTE_ADDED').length;

    doc.addPage();
    
    // صندوق الإحصائيات
    const boxY = 100;
    doc.rect(50, boxY, doc.page.width - 100, 150).fill('#f8f9fa');
    doc.rect(50, boxY, doc.page.width - 100, 40).fill('#0066cc');
    
    doc
      .fillColor('#ffffff')
      .fontSize(16)
      .text('ملخص الإحصائيات', 50, boxY + 10, { 
        align: 'center',
        width: doc.page.width - 100,
      });

    doc.fillColor('#333333').fontSize(13);
    const statsY = boxY + 60;
    doc.text(`إجمالي الأحداث: ${totalEvents}`, 70, statsY);
    doc.text(`تغييرات الحالة: ${statusChanges}`, 70, statsY + 25);
    doc.text(`التفاعلات: ${interactions}`, 70, statsY + 50);
    doc.text(`الملاحظات: ${notes}`, 70, statsY + 75);

    // الفوتر النهائي
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text(
        `تم إنشاء هذا التقرير في: ${this.formatDate(new Date())}`,
        50,
        doc.page.height - 50,
        { align: 'center', width: doc.page.width - 100 }
      );
  }

  /**
   * تنسيق التاريخ
   */
  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * حساب حجم الملف
   */
  getFileSize(filePath: string): string {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    return fileSizeInMB < 1
      ? `${(fileSizeInBytes / 1024).toFixed(2)} KB`
      : `${fileSizeInMB.toFixed(2)} MB`;
  }

  /**
   * حذف الملف بعد التنزيل
   */
//   deleteFile(filePath: string): void {
//     try {
//       if (fs.existsSync(filePath)) {
//         fs.unlinkSync(filePath);
//       }
//     } catch (error) {
//       console.error('Error deleting file:', error);
//     }
//   }
}