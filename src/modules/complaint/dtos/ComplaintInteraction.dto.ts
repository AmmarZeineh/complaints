import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';

export class ComplaintInteractionDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  complaintId: number;

  @ApiProperty()
  senderId: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  type: InteractionType;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [String] })
  documents: string[];

  @ApiProperty()
  createdAt: Date;

  constructor(raw: RawComplaintInteraction) {
    this.id = raw.id;
    this.complaintId = raw.complaintId;
    this.senderId = raw.senderId;
    this.message = raw.message;
    this.type = raw.type;
    this.images = this.parseArray(raw.images);
    this.documents = this.parseArray(raw.documents);
    this.createdAt = raw.createdAt;
  }

  private parseArray(field: string | string[] | null | undefined): string[] {
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

export type RawComplaintInteraction = {
  id: number;
  complaintId: number;
  senderId: number;
  message: string;
  images: string | string[];
    type: InteractionType;
  documents: string | string[];
  createdAt: Date;
};
