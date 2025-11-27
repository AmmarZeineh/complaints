import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import { selectComplaintValidator } from '../validators/select-complaint-validator';
import { CreateComplaintDto } from '../dtos/create-complaint.dto';
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

  constructor(private readonly _prisma: PrismaService) {}

  async create(
  dto: CreateComplaintDto, 
  userId: number, 
  files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] }
) {
  // أولاً، إنشاء الشكوى بدون ملفات
  const raw = await this._prisma.complaint.create({
    data: {
      userId,
      governmentId: dto.governmentId,
      description: dto.description,
      Location: dto.Location,
      type: dto.type,
    },
    select: selectComplaintValidator(),
  });

  // ثم حفظ الملفات بعد معرفة الـ complaintId و userId
  const { imagePaths, documentPaths } = await this.processFiles(files, raw.id, userId);

  // تحديث الشكوى لإضافة مسارات الملفات
  const updated = await this._prisma.complaint.update({
    where: { id: raw.id },
    data: {
      images: JSON.stringify(imagePaths),
      documents: JSON.stringify(documentPaths),
    },
    select: selectComplaintValidator(),
  });

  return updated;
}

private async processFiles(
  files?: { images?: Express.Multer.File[], documents?: Express.Multer.File[] },
  complaintId?: number,
  userId?: number
) {
  const imagePaths: string[] = [];
  const documentPaths: string[] = [];

  if (!files || !complaintId || !userId) return { imagePaths, documentPaths };

  const images = files.images || [];
  const documents = files.documents || [];

  for (const image of images) {
    const savedPath = await this.saveFile(image, 'images', complaintId, userId);
    imagePaths.push(savedPath);
  }

  for (const doc of documents) {
    const savedPath = await this.saveFile(doc, 'documents', complaintId, userId);
    documentPaths.push(savedPath);
  }

  return { imagePaths, documentPaths };
}

private async saveFile(
  file: Express.Multer.File, 
  subDir: 'images' | 'documents', 
  complaintId: number,
  userId: number
): Promise<string> {
  const dir = path.join('uploads', 'complaints', `user_${userId}`, `complaint_${complaintId}`, subDir);
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `${Date.now()}_${file.originalname}`;
  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, file.buffer);

  return filePath;
}

}
