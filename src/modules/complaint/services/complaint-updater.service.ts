// modules/complaint/services/complaint-updater.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UpdateComplaintDto } from '../dtos/update-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';
import { ComplaintHistoryService } from '../../complaintHistory/services/complaintHistory-creator.service';
import { join, extname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

@Injectable()
export class ComplaintUpdaterService {
  private readonly BASE_URL = 'http://localhost:3000';

  constructor(
    private readonly _prisma: PrismaService,
    private readonly historyService: ComplaintHistoryService,
  ) {}

  async update(
    id: number,
    dto: UpdateComplaintDto,
    userId: number,
    files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] }
  ) {
    // جلب الشكوى القديمة
    const oldComplaint = await this._prisma.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        description: true,
        Location: true,
        type: true,
        status: true,
      },
    });

    if (!oldComplaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (oldComplaint.userId !== userId) {
      throw new ForbiddenException('You can only update your own complaints');
    }

    // تحديث الشكوى
    const updatedComplaint = await this._prisma.complaint.update({
      where: { id },
      data: {
        description: dto.description,
        Location: dto.Location,
        type: dto.type,
      },
      select: selectComplaintValidator(),
    });

    // معالجة الملفات الجديدة إذا وُجدت
    if (files && (files.images?.length || files.documents?.length)) {
      const { imageUrls, documentUrls } = await this.processFiles(
        files,
        id,
        userId
      );

      await this._prisma.complaint.update({
        where: { id },
        data: {
          images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
          documents: documentUrls.length > 0 ? JSON.stringify(documentUrls) : null,
        },
      });
    }

    // ✅ تسجيل التعديل في السجل الزمني
    await this.historyService.logComplaintUpdated(
      id,
      userId,
      oldComplaint,
      dto
    );

    return updatedComplaint;
  }

  async assignComplaint(complaintId: number, employeeId: number) {
    const complaint = await this._prisma.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        employeeId: true,
        governmentId: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    if (complaint.employeeId) {
      throw new BadRequestException('الشكوى محجوزة بالفعل');
    }

    // التحقق من أن الموظف ينتمي لنفس الجهة
    const employee = await this._prisma.user.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        governmentId: true,
        role: { select: { name: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    if (employee.role.name !== 'EMPLOYEE') {
      throw new ForbiddenException('فقط الموظفون يمكنهم حجز الشكاوى');
    }

    if (employee.governmentId !== complaint.governmentId) {
      throw new ForbiddenException('لا يمكنك حجز شكوى من جهة أخرى');
    }

    const updated = await this._prisma.complaint.update({
      where: { id: complaintId },
      data: { employeeId },
      select: selectComplaintValidator(),
    });

    // ✅ تسجيل الحجز في السجل الزمني
    await this.historyService.logComplaintAssigned(
      complaintId,
      employeeId,
      employee.name
    );

    return updated;
  }

  async updateStatus(complaintId: number, status: string, employeeId: number) {
    const complaint = await this._prisma.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        employeeId: true,
        status: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    if (complaint.employeeId !== employeeId) {
      throw new ForbiddenException('يمكنك فقط تعديل الشكاوى المحجوزة لك');
    }

    const oldStatus = complaint.status;

    const updated = await this._prisma.complaint.update({
      where: { id: complaintId },
      data: { status: status as any },
      select: selectComplaintValidator(),
    });

    // ✅ تسجيل تغيير الحالة في السجل الزمني
    await this.historyService.logStatusChanged(
      complaintId,
      employeeId,
      oldStatus,
      status
    );

    return updated;
  }

  private async processFiles(
    files: { images?: Express.Multer.File[], documents?: Express.Multer.File[] },
    complaintId: number,
    userId: number
  ) {
    const imageUrls: string[] = [];
    const documentUrls: string[] = [];

    const images = files.images || [];
    const documents = files.documents || [];

    const baseUpload = join(process.cwd(), 'uploads', String(userId), 'complaints', String(complaintId));
    const imagesDir = join(baseUpload, 'images');
    const documentsDir = join(baseUpload, 'documents');

    [imagesDir, documentsDir].forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const url = await this.saveFile(image, imagesDir, userId, complaintId, 'images', i);
      imageUrls.push(url);
    }

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const url = await this.saveFile(doc, documentsDir, userId, complaintId, 'documents', i);
      documentUrls.push(url);
    }

    return { imageUrls, documentUrls };
  }

  private async saveFile(
    file: Express.Multer.File,
    directory: string,
    userId: number,
    complaintId: number,
    typePath: string,
    index: number,
  ): Promise<string> {
    const timestamp = Date.now();
    const ext = extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').split('.')[0];
    const filename = `${timestamp}_${index}_${safeName}${ext}`;
    
    const filepath = join(directory, filename);
    writeFileSync(filepath, file.buffer);

    return `${this.BASE_URL}/uploads/${userId}/complaints/${complaintId}/${typePath}/${filename}`;
  }
}