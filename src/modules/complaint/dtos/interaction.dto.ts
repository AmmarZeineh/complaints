import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';

export class InteractionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  complaintId: number;

  @ApiProperty()
  senderId: number;

  @ApiProperty({ required: false })
  receiverId?: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: InteractionType })
  type: InteractionType;

  @ApiProperty({
    type: [String],
    description: 'Array of image URLs',
    example: [
      'http://localhost:3000/uploads/2/complaints/7/interactions/15/images/1764418348297_0_image1.png'
    ]
  })
  images: string[];

  @ApiProperty({
    type: [String],
    description: 'Array of document URLs',
    example: [
      'http://localhost:3000/uploads/2/complaints/7/interactions/15/documents/1764418348299_0_report.pdf'
    ]
  })
  documents: string[];

  @ApiProperty()
  isRead: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  sender?: { id: number; name: string; role: string };

  @ApiProperty({ required: false })
  receiver?: { id: number; name: string; role: string };

  constructor(raw: RawInteraction) {
    this.id = raw.id;
    this.complaintId = raw.complaintId;
    this.senderId = raw.senderId;
    this.receiverId = raw.receiverId;
    this.message = raw.message;
    this.type = raw.type;
    
    // ✅ نفس منطق ComplaintDto
    this.images = this.parseField(raw.images);
    this.documents = this.parseField(raw.documents);
    
    this.isRead = raw.isRead;
    this.createdAt = raw.createdAt;
    this.sender = raw.sender;
    this.receiver = raw.receiver;
  }

  private parseField(field: string | string[] | null | undefined): string[] {
    if (Array.isArray(field)) return field;
    if (!field) return [];
    
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [field];
    }
  }
}

export type RawInteraction = {
  id: number;
  complaintId: number;
  senderId: number;
  receiverId?: number;
  message: string;
  type: InteractionType;
  images: string | string[];
  documents: string | string[];
  isRead: boolean;
  createdAt: Date;
  sender?: {
    id: number;
    name: string;
    role: string;
  };
  receiver?: {
    id: number;
    name: string;
    role: string;
  };
};