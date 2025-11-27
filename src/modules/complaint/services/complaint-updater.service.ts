import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UpdateComplaintDto } from '../dtos/update-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';
import path from 'path';
import * as fs from 'fs';

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

  constructor(private readonly _prisma: PrismaService) {}

  async update(
    id: number,
    dto: UpdateComplaintDto,
    userId: number,
    files?: Express.Multer.File[],
  ) {
    const existingComplaint = await this._prisma.complaint.findUnique({
      where: { id },
    });

    if (!existingComplaint) {
      throw new NotFoundException('الشكوى غير موجودة');
    }

    if (existingComplaint.userId !== userId) {
      throw new BadRequestException('لا يمكنك تعديل شكوى مستخدم آخر');
    }

    const updateData: any = {};

    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.Location !== undefined) updateData.Location = dto.Location;

    // معالجة الصور
    let currentImages: string[] = existingComplaint.images 
      ? JSON.parse(existingComplaint.images) 
      : [];
    
    if (dto.deleteAllImages) {
      this.deleteFilesFromDisk(currentImages);
      currentImages = [];
    } else if (dto.imagesToDelete && dto.imagesToDelete.length > 0) {
      for (const imgName of dto.imagesToDelete) {
        const imgPath = currentImages.find(p => p.includes(imgName));
        if (imgPath) {
          this.deleteFileFromDisk(imgPath);
          currentImages = currentImages.filter(p => p !== imgPath);
        }
      }
    }

    if (files && files.length > 0) {
      const newImages = files.filter(f => this.ALLOWED_IMAGE_TYPES.includes(f.mimetype));
      
      if (currentImages.length + newImages.length > this.MAX_IMAGES) {
        throw new BadRequestException(
          `لا يمكن إضافة أكثر من ${this.MAX_IMAGES} صور. لديك حالياً ${currentImages.length} صور`
        );
      }

      for (const img of newImages) {
        if (img.size > this.MAX_IMAGE_SIZE) {
          throw new BadRequestException(`حجم الصورة ${img.originalname} كبير جداً`);
        }
        const savedPath = await this.saveFile(img, 'images');
        currentImages.push(savedPath);
      }
    }

    updateData.images = JSON.stringify(currentImages);

    // معالجة الملفات
    let currentDocuments: string[] = existingComplaint.documents 
      ? JSON.parse(existingComplaint.documents) 
      : [];
    
    if (dto.deleteAllDocuments) {
      this.deleteFilesFromDisk(currentDocuments);
      currentDocuments = [];
    } else if (dto.documentsToDelete && dto.documentsToDelete.length > 0) {
      for (const docName of dto.documentsToDelete) {
        const docPath = currentDocuments.find(p => p.includes(docName));
        if (docPath) {
          this.deleteFileFromDisk(docPath);
          currentDocuments = currentDocuments.filter(p => p !== docPath);
        }
      }
    }

    if (files && files.length > 0) {
      const newDocs = files.filter(f => this.ALLOWED_DOCUMENT_TYPES.includes(f.mimetype));
      
      if (currentDocuments.length + newDocs.length > this.MAX_DOCUMENTS) {
        throw new BadRequestException(
          `لا يمكن إضافة أكثر من ${this.MAX_DOCUMENTS} ملفات. لديك حالياً ${currentDocuments.length} ملفات`
        );
      }

      for (const doc of newDocs) {
        if (doc.size > this.MAX_DOCUMENT_SIZE) {
          throw new BadRequestException(`حجم الملف ${doc.originalname} كبير جداً`);
        }
        const savedPath = await this.saveFile(doc, 'documents');
        currentDocuments.push(savedPath);
      }
    }

    updateData.documents = JSON.stringify(currentDocuments);

    return await this._prisma.complaint.update({
      where: { id },
      data: updateData,
      select: selectComplaintValidator(),
    });
  }

  private async saveFile(
    file: Express.Multer.File,
    subDir: 'images' | 'documents'
  ): Promise<string> {
    const dir = path.join('uploads', 'complaints', subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    return filePath;
  }

  private deleteFileFromDisk(filePath: string) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('فشل حذف الملف:', error);
      }
    }
  }

  private deleteFilesFromDisk(filePaths: string[]) {
    filePaths.forEach(path => this.deleteFileFromDisk(path));
  }
}