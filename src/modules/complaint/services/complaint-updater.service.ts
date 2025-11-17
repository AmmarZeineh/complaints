import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UpdateComplaintDto } from '../dtos/update-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ComplaintUpdaterService {
  constructor(private readonly _prisma: PrismaService) {}

  async update(
    id: number,
    dto: UpdateComplaintDto,
    userId: number,
    file?: Express.Multer.File,
  ) {
    // 1. تحقق من وجود الشكوى والصلاحية
    const existingComplaint = await this._prisma.complaint.findUnique({
      where: { id },
    });

    if (!existingComplaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    if (existingComplaint.userId !== userId) {
      throw new BadRequestException('لا يمكنك تعديل شكوى مستخدم آخر');
    }

    // 2. بناء بيانات التحديث
    const updateData: Prisma.ComplaintUpdateInput = {
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.type !== undefined && { type: dto.type }),
    };

    // 3. معالجة حذف المستند
    if (dto.deleteDocument === true) {
      // حذف الملف من السيرفر
      if (existingComplaint.documents && fs.existsSync(existingComplaint.documents)) {
        try {
          fs.unlinkSync(existingComplaint.documents);
        } catch (error) {
          console.error('فشل حذف الملف:', error);
        }
      }
      // حذف المسار من قاعدة البيانات
      updateData.documents = null;
    }
    // 4. معالجة رفع ملف جديد (فقط إذا لم يطلب الحذف)
    else if (file) {
      const dir = path.join('uploads', 'complaints');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // حذف الملف القديم
      if (existingComplaint.documents && fs.existsSync(existingComplaint.documents)) {
        try {
          fs.unlinkSync(existingComplaint.documents);
        } catch (error) {
          console.error('فشل حذف الملف القديم:', error);
        }
      }

      const fileName = `${Date.now()}_${file.originalname}`;
      const filePath = path.join(dir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      updateData.documents = filePath;
    }

    // 5. تحقق من وجود بيانات للتحديث
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('لم يتم إرسال أي بيانات للتحديث');
    }

    // 6. تحديث الشكوى
    return await this._prisma.complaint.update({
      where: { id },
      data: updateData,
      select: selectComplaintValidator(),
    });
  }
}