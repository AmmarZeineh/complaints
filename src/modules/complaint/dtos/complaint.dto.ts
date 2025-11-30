import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class ComplaintDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;
  
  @ApiProperty()
  emplyeeId: number;

  @ApiProperty()
  governmentId: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  Location: string;

  @ApiProperty()
  type: string;

  @ApiProperty({
    type: [String],
    description: 'Array of document URLs',
    example: [
      'http://localhost:3000/uploads/2/complaints/7/documents/1764418348299_0_report.pdf'
    ]
  })
  documents: string[];
  
  @ApiProperty({
    type: [String],
    description: 'Array of image URLs',
    example: [
      'http://localhost:3000/uploads/2/complaints/7/images/1764418348297_0_image1.png',
      'http://localhost:3000/uploads/2/complaints/7/images/1764418348298_1_image2.png'
    ]
  })
  images: string[];

  @ApiProperty({ enum: Status })
  status: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  user?: { id: number; name: string };

  @ApiProperty({ required: false })
  government?: { id: number; name: string };

  constructor(raw: RawComplaint) {
    this.id = raw.id;
    this.userId = raw.userId;
    this.governmentId = raw.governmentId;
    this.description = raw.description;
    this.Location = raw.Location;
    this.type = raw.type;
    
    // ✅ تحويل من string أو string[] لـ string[] نهائياً
    this.documents = this.parseField(raw.documents);
    this.images = this.parseField(raw.images);
    
    this.status = raw.status;
    this.createdAt = raw.createdAt; 
    this.updatedAt = raw.updatedAt;
    this.user = raw.user;
    this.government = raw.government;
  }

  private parseField(field: string | string[] | null | undefined): string[] {
    // إذا كان array بالفعل، إرجاعه مباشرة
    if (Array.isArray(field)) {
      return field;
    }
    
    // إذا كان null أو undefined
    if (!field) {
      return [];
    }
    
    // إذا كان string، حاول parse كـ JSON
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // إذا فشل الـ parse، يعني string عادي مش JSON
      return [field];
    }
  }
}

export type RawComplaint = {
  id: number;
  userId: number;
  governmentId: number;
  description: string;
  Location: string;
  documents: string | string[];  // ✅ يقبل النوعين
  images: string | string[];     // ✅ يقبل النوعين
  status: Status;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
  };
  government?: {
    id: number;
    name: string;
  };
};