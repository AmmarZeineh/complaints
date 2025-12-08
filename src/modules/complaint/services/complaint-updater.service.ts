import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UpdateComplaintDto } from '../dtos/update-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';
import { join, extname } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { Status } from '@prisma/client';
import { NotificationService } from 'src/modules/notification/notification.service';
import { console } from 'inspector';
import { ComplaintHistoryService } from 'src/modules/complaintHistory/services/complaintHistory-creator.service';

@Injectable()
export class ComplaintUpdaterService {
  private readonly MAX_IMAGES = 10;
  private readonly MAX_DOCUMENTS = 5;
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  private readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
  
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  private readonly BASE_URL = 'http://localhost:3000';

  constructor(
    private readonly _prisma: PrismaService,  
    private readonly notificationService:NotificationService,
    private readonly historyService: ComplaintHistoryService,
) {}

  async update(
    id: number,
    dto: UpdateComplaintDto,
    userId: number,
    files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] },
  ): Promise<any> {
    // جلب الشكوى الحالية
    const oldComplaint = await this._prisma.complaint.findUnique({
      where: { id, deletedAt: null },
    });

    if (!oldComplaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    if (oldComplaint.userId !== userId) {
      throw new BadRequestException('لا يمكنك تعديل شكوى مستخدم آخر');
    }

    // ✅ التحقق من الملفات الجديدة قبل البدء
    this.validateFiles(files);

    const updateData: any = {};

    // تحديث الحقول النصية
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.Location !== undefined) updateData.Location = dto.Location;

    // ✅ معالجة الصور
    let currentImages = this.parseJsonField(oldComplaint.images);

    if (dto.deleteAllImages === true) {
      this.deleteFilesFromDisk(currentImages);
      currentImages = [];
    } else if (dto.imagesToDelete && dto.imagesToDelete.length > 0) {
      for (const identifier of dto.imagesToDelete) {
        const imageUrl = currentImages.find(url => 
          url === identifier || url.includes(identifier)
        );
        
        if (imageUrl) {
          this.deleteFileFromUrl(imageUrl);
          const index = currentImages.indexOf(imageUrl);
          currentImages.splice(index, 1);
        }
      }
    }

    // إضافة صور جديدة
    if (files?.images && files.images.length > 0) {
      if (currentImages.length + files.images.length > this.MAX_IMAGES) {
        throw new BadRequestException(
          `لا يمكن إضافة أكثر من ${this.MAX_IMAGES} صور. لديك حالياً ${currentImages.length} صور`
        );
      }

      for (const img of files.images) {
        const url = await this.saveFile(img, oldComplaint.userId, id, 'images', currentImages.length);
        currentImages.push(url);
      }
    }

    updateData.images = JSON.stringify(currentImages);

    // ✅ معالجة المستندات
    let currentDocuments = this.parseJsonField(oldComplaint.documents);

    if (dto.deleteAllDocuments === true) {
      this.deleteFilesFromDisk(currentDocuments);
      currentDocuments = [];
    } else if (dto.documentsToDelete && dto.documentsToDelete.length > 0) {
      for (const identifier of dto.documentsToDelete) {
        const docUrl = currentDocuments.find(url => 
          url === identifier || url.includes(identifier)
        );
        
        if (docUrl) {
          this.deleteFileFromUrl(docUrl);
          const index = currentDocuments.indexOf(docUrl);
          currentDocuments.splice(index, 1);
        }
      }
    }

    // إضافة مستندات جديدة
    if (files?.documents && files.documents.length > 0) {
      if (currentDocuments.length + files.documents.length > this.MAX_DOCUMENTS) {
        throw new BadRequestException(
          `لا يمكن إضافة أكثر من ${this.MAX_DOCUMENTS} ملفات. لديك حالياً ${currentDocuments.length} ملفات`
        );
      }

      for (const doc of files.documents) {
        const url = await this.saveFile(doc, oldComplaint.userId, id, 'documents', currentDocuments.length);
        currentDocuments.push(url);
      }
    }

    updateData.documents = JSON.stringify(currentDocuments);

    // تحديث الشكوى في قاعدة البيانات
    const updated = await this._prisma.complaint.update({
      where: { id },
      data: updateData,
      select: selectComplaintValidator(),
    });

    //     // ✅ تسجيل التعديل في السجل الزمني
    await this.historyService.logComplaintUpdated(
      id,
      userId,
      oldComplaint,
      dto
    );

    // إرجاع البيانات مع تحويل JSON strings لـ arrays
    return {
      ...updated,
      images: this.parseJsonField(updated.images),
      documents: this.parseJsonField(updated.documents),
    };
  }

  // ✅ Validation للملفات الجديدة
  private validateFiles(
    files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] }
  ) {
    if (!files) return;

    const images = files.images || [];
    const documents = files.documents || [];

    // التحقق من نوع وحجم الصور
    images.forEach((image) => {
      if (!this.ALLOWED_IMAGE_TYPES.includes(image.mimetype)) {
        throw new BadRequestException(
          `نوع الصورة غير مسموح: ${image.originalname}. الأنواع المسموحة: JPEG, JPG, PNG, GIF`
        );
      }
      if (image.size > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          `حجم الصورة ${image.originalname} كبير جداً. الحد الأقصى: 5MB`
        );
      }
    });

    // التحقق من نوع وحجم المستندات
    documents.forEach((doc) => {
      if (!this.ALLOWED_DOCUMENT_TYPES.includes(doc.mimetype)) {
        throw new BadRequestException(
          `نوع المستند غير مسموح: ${doc.originalname}. الأنواع المسموحة: PDF, DOC, DOCX, XLS, XLSX`
        );
      }
      if (doc.size > this.MAX_DOCUMENT_SIZE) {
        throw new BadRequestException(
          `حجم المستند ${doc.originalname} كبير جداً. الحد الأقصى: 10MB`
        );
      }
    });
  }

  private parseJsonField(field: string | null | undefined): string[] {
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async saveFile(
    file: Express.Multer.File,
    userId: number,
    complaintId: number,
    type: 'images' | 'documents',
    index: number,
  ): Promise<string> {
    const baseUpload = join(process.cwd(), 'uploads', String(userId), 'complaints', String(complaintId));
    const directory = join(baseUpload, type);

    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }

    const timestamp = Date.now();
    const ext = extname(file.originalname);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_').split('.')[0];
    const filename = `${timestamp}_${index}_${safeName}${ext}`;
    
    const filepath = join(directory, filename);
    writeFileSync(filepath, file.buffer);

    const fileUrl = `${this.BASE_URL}/uploads/${userId}/complaints/${complaintId}/${type}/${filename}`;
    return fileUrl;
  }

  private deleteFileFromUrl(url: string) {
    try {
      const urlPath = url.replace(this.BASE_URL + '/', '');
      const filePath = join(process.cwd(), urlPath);
      
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error) {
      // Silent fail - الملف قد يكون محذوف مسبقاً
    }
  }

  private deleteFilesFromDisk(urls: string[]) {
    urls.forEach(url => this.deleteFileFromUrl(url));
  }



  async assignComplaint(complaintId: number, employeeId: number) {

  const user = await this._prisma.user.findUnique({
    where: { id: employeeId },
    include: { role: true }, // مهم حتى يجيب نوع الدور
  });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  // 2. تحقق إنو موظّف فعلياً
  if (user.role.name !== "EMPLOYEE") {
    throw new ForbiddenException("Only employees can assign complaints");
  }

  //     // التحقق من أن الموظف ينتمي لنفس الجهة
    const employee = await this._prisma.user.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        governmentId: true,
        role: { select: { name: true } },
      },
    });

  const complaint = await this._prisma.complaint.findUnique({
    where: { id: complaintId },
  });

  if (!complaint) {
    throw new NotFoundException("Complaint not found");
  }

  if(complaint.employeeId === employeeId){
    throw new BadRequestException("You are already assigned to this complaint");
  }

  if(complaint.userId === employeeId){
    throw new BadRequestException("You cannot assign a complaint to yourself");
  }
  if(complaint.status === "COMPLETED" || complaint.status === "REJECTED"){
    throw new BadRequestException("Cannot assign a completed or rejected complaint");
  }
  
  if (complaint.employeeId !== null && complaint.status !== "NEW") {
    throw new BadRequestException("Complaint already assigned to another employee");
  }

  if (complaint.status !== "NEW") {
    throw new BadRequestException("Complaint is not available for assignment");
  }

    // 4. إرسال الإشعارات لصاحب الشكوى
  const tokens = await this._prisma.userToken.findMany({
    where: { userId: complaint.userId },
  });

  const title = "تم استلام الشكوى الخاصة بك";

  for (const t of tokens) {
    const body = `تم استلام شكواك رقم ${complaint.id} من قبل الموظف وهي الآن قيد المعالجة.`;

    // إرسال الإشعار عبر FCM
    await this.notificationService.sendNotification(t.fcmToken, title, body);

    // حفظ الإشعار في قاعدة البيانات
    await this._prisma.notification.create({
      data: {
        userId: complaint.userId,
        title,
        body,
        type: "COMPLAINT_ASSIGNED",
        data: {
          complaintId: complaint.id,
        },
      },
    });
  }

  const updated =  await this._prisma.complaint.update({
    where: { id: complaintId },
    data: {
      employeeId,
      status: "INPROCESS",
    },
    select: selectComplaintValidator(),
  });

      await this.historyService.logComplaintAssigned(
      complaintId,
      employeeId,
      employee.name
    );
    return updated;
}

//     const complaint = await this._prisma.complaint.findUnique({
//       where: { id: complaintId },
//       select: {
//         id: true,
//         employeeId: true,
//         status: true,
//       },
//     });

async updateStatus(complaintId: number, newStatus: string, employeeId:number) {
  const complaint = await this._prisma.complaint.findUnique({
    where: { id: complaintId },
  
  });

  if (!complaint) {
    throw new NotFoundException("Complaint not found");
  }

  const allowedStatuses = ["NEW", "INPROCESS", "COMPLETED", "REJECTED"];

  if (!allowedStatuses.includes(newStatus)) {
    throw new BadRequestException("Invalid status value");
  }
  if(complaint.employeeId !== employeeId){
    throw new ForbiddenException("You are not assigned to this complaint");
  }
  
  if (complaint.status === "COMPLETED" || complaint.status === "REJECTED") {
    throw new BadRequestException("Complaint is already completed or rejected");
  }
  
  
  const tokens = await this._prisma.userToken.findMany({
  where: { userId: complaint.userId },
  });
for (const t of tokens) {
  const title = 'تغيير الحالة للشكوى الخاصة بك';
  const body = `تم تغيير حالة الشكوى الخاصة بك إلى: ${newStatus}`;


  // send push
  await this.notificationService.sendNotification(t.fcmToken, title, body);

  // save in DB
  await this._prisma.notification.create({
    data: {
      userId:  complaint.userId, 
      title,
      body,
      type: 'COMPLAINT_STATUS_CHANGED',
      data: {
        complaintId: complaint.id,
        newStatus: newStatus,
      },
    },
  });
}

   const oldStatus = complaint.status;

 const updated = this._prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: newStatus as Status,
    },
     select: selectComplaintValidator(),
  });


//     // ✅ تسجيل تغيير الحالة في السجل الزمني
    await this.historyService.logStatusChanged(
      complaintId,
      employeeId,
      oldStatus,
      newStatus
    );

    return updated;

}}
