import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { join, extname } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { selectComplaintValidator } from '../validators/select-complaint-validator';
import { CreateComplaintDto } from '../dtos/create-complaint.dto';
import { CreateInteractionDto } from '../dtos/create-interaction.dto';
import { NotificationService } from 'src/modules/notification/notification.service';

@Injectable()
export class ComplaintCreatorService {
  private readonly MAX_IMAGES = 10;
  private readonly MAX_DOCUMENTS = 5;
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
  
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
    private readonly notificationService: NotificationService
  ) {}

  async create(
    dto: CreateComplaintDto, 
    userId: number, 
    files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] }
  ) {
 
    // التحقق من عدد وحجم الملفات
    this.validateFiles(files);

    // إنشاء الشكوى أولاً
    const complaint = await this._prisma.complaint.create({
      data: {
        userId,
        governmentId: dto.governmentId,
        description: dto.description,
        Location: dto.Location,
        type: dto.type,
      },
      select: selectComplaintValidator(),
    });

    // حفظ الملفات والحصول على URLs
    const { imageUrls, documentUrls } = await this.processFiles(
      files, 
      complaint.id, 
      userId
    );

 

    // تحديث الشكوى بمسارات الملفات (حفظ كـ JSON string)
    const updatedComplaint = await this._prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        documents: documentUrls.length > 0 ? JSON.stringify(documentUrls) : null,
      },
      select: selectComplaintValidator(),
    });

    // إرجاع البيانات مع تحويل JSON strings لـ arrays
    return {
      ...updatedComplaint,
      images: updatedComplaint.images ? JSON.parse(updatedComplaint.images) : [],
      documents: updatedComplaint.documents ? JSON.parse(updatedComplaint.documents) : [],
    };
  }



    
  async createInteraction(
    dto: CreateInteractionDto,
    senderId: number,
    files?: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    const { complaintId, type, message } = dto;

    // 1) تأكد من وجود الشكوى
    const complaint = await this._prisma.complaint.findUnique({
      where: { id: complaintId },
      select: { id: true, userId: true, employeeId: true },
    });

    if (!complaint) {
      throw new BadRequestException('Complaint not found');
    }

    // 2) تحديد المستقبل
    const receiverId =
      senderId === complaint.userId ? complaint.employeeId : complaint.userId;

    if (!receiverId) {
      throw new BadRequestException(
        'No receiver available. Complaint may not be assigned yet.',
      );
    }

    // 3) إنشاء سجل التفاعل الأساسي
    const interaction = await this._prisma.complaintInteraction.create({
      data: {
        complaintId,
        senderId,
        receiverId,
        type,
        message,
      },
    });

    const imageUrls: string[] = [];
    const documentUrls: string[] = [];

    // 4) إذا في ملفات، بدنا نخزنهم مثل الشكوى الأساسية
    if (files) {
      const baseUpload = join(
        process.cwd(),
        'uploads',
        String(complaint.userId),
        'complaints',
        String(complaintId),
        'interactions',
        String(interaction.id),
      );

      const imagesDir = join(baseUpload, 'images');
      const documentsDir = join(baseUpload, 'documents');

      [imagesDir, documentsDir].forEach((dir) => {
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      });

      // الحفظ
      for (let i = 0; i < (files.images?.length || 0); i++) {
        const image = files.images![i];
        const url = await this.saveFile(
          image,
          imagesDir,
          complaint.userId,
          complaintId,
          `interactions/${interaction.id}/images`,
          i,
        );
        imageUrls.push(url);
      }

      for (let i = 0; i < (files.documents?.length || 0); i++) {
        const doc = files.documents![i];
        const url = await this.saveFile(
          doc,
          documentsDir,
          complaint.userId,
          complaintId,
          `interactions/${interaction.id}/documents`,
          i,
        );
        documentUrls.push(url);
      }
    }

    // 5) تحديث الملفات
    await this._prisma.complaintInteraction.update({
      where: { id: interaction.id },
      data: {
        images: imageUrls.length ? JSON.stringify(imageUrls) : null,
        documents: documentUrls.length ? JSON.stringify(documentUrls) : null,
      },
    });



  // 6) إرسال إشعار للمستقبل
  const tokens = await this._prisma.userToken.findMany({
    where: { userId: receiverId },
  });

  const title = "تم استلام تفاعل جديد على الشكوى الخاصة بك";
  const body = `لديك تفاعل جديد على الشكوى رقم ${complaint.id}: "${message}"`;

  for (const t of tokens) {
    // إرسال الإشعار عبر FCM
    await this.notificationService.sendNotification(t.fcmToken, title, body);

    // حفظ الإشعار في قاعدة البيانات
    await this._prisma.notification.create({
      data: {
        userId: receiverId,
        title,
        body,
        type: "COMPLAINT_INTERACTION",
        data: {
          complaintId: complaint.id,
          interactionId: interaction.id,
        },
      },
    });
  }


    return {
      ...interaction,
      images: imageUrls,
      documents: documentUrls,
    };
  }

  private validateFiles(
    files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] }
  ) {
    if (!files) return;

    const images = files.images || [];
    const documents = files.documents || [];

    // التحقق من عدد الصور
    if (images.length > this.MAX_IMAGES) {
      throw new BadRequestException(`Maximum ${this.MAX_IMAGES} images allowed`);
    }

    // التحقق من عدد المستندات
    if (documents.length > this.MAX_DOCUMENTS) {
      throw new BadRequestException(`Maximum ${this.MAX_DOCUMENTS} documents allowed`);
    }

    // التحقق من نوع وحجم الصور
    images.forEach((image, index) => {
     

      if (!this.ALLOWED_IMAGE_TYPES.includes(image.mimetype)) {
        throw new BadRequestException(`Invalid image type: ${image.mimetype}`);
      }
      if (image.size > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException(`Image ${image.originalname} exceeds 5MB limit`);
      }
    });

    // التحقق من نوع وحجم المستندات
    documents.forEach((doc, index) => {
    

      if (!this.ALLOWED_DOCUMENT_TYPES.includes(doc.mimetype)) {
        throw new BadRequestException(`Invalid document type: ${doc.mimetype}`);
      }
      if (doc.size > this.MAX_DOCUMENT_SIZE) {
        throw new BadRequestException(`Document ${doc.originalname} exceeds 10MB limit`);
      }
    });
  }

  private async processFiles(
    files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] },
    complaintId?: number,
    userId?: number
  ) {
    const imageUrls: string[] = [];
    const documentUrls: string[] = [];

    if (!files || !complaintId || !userId) {
      return { imageUrls, documentUrls };
    }

    const images = files.images || [];
    const documents = files.documents || [];

    // إنشاء المجلدات
    const baseUpload = join(process.cwd(), 'uploads', String(userId), 'complaints', String(complaintId));
    const imagesDir = join(baseUpload, 'images');
    const documentsDir = join(baseUpload, 'documents');

    [imagesDir, documentsDir].forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // حفظ الصور
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const url = await this.saveFile(image, imagesDir, userId, complaintId, 'images', i);
      imageUrls.push(url);
    }

    // حفظ المستندات
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

  // مثال URL:
  // uploads/5/complaints/8/interactions/3/images/image.png
  return `${this.BASE_URL}/uploads/${userId}/complaints/${complaintId}/${typePath}/${filename}`;
}

}