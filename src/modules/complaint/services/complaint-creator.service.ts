import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { CreateComplaintDto } from '../dtos/create-complaint.dto';
import { selectComplaintValidator } from '../validators/select-complaint-validator';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ComplaintCreatorService {
  constructor(private readonly _prisma: PrismaService) {}

  async create(dto: CreateComplaintDto, userId: number, file?: Express.Multer.File) {
    let documentPath = null;

    if (file) {
    const dir = path.join('uploads', 'complaints');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const fileName = `${Date.now()}_${file.originalname}`;
const filePath = path.join(dir, fileName);

fs.writeFileSync(filePath, file.buffer);
documentPath = filePath;

    }

    return await this._prisma.complaint.create({
      data: {
        userId,
        governmentId: dto.governmentId,
        description: dto.description,
        Location: dto.Location,
        type: dto.type,
        documents: documentPath,
      },
      select: selectComplaintValidator(),
    });
  }
}
