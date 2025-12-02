import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { ComplaintInteractionDto, RawComplaintInteraction } from './ComplaintInteraction.dto';

export class ComplaintDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  governmentId: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  Location: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ type: [String] })
  documents: string[];

  @ApiProperty({ type: [String] })
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

  @ApiProperty({ type: [ComplaintInteractionDto], required: false })
  interactions?: ComplaintInteractionDto[];

  constructor(raw: RawComplaint) {
    this.id = raw.id;
    this.userId = raw.userId;
    this.governmentId = raw.governmentId;
    this.description = raw.description;
    this.Location = raw.Location;
    this.type = raw.type;

    this.documents = this.parse(raw.documents);
    this.images = this.parse(raw.images);

    this.status = raw.status;
    this.createdAt = raw.createdAt;
    this.updatedAt = raw.updatedAt;

    this.user = raw.user;
    this.government = raw.government;

    // 🔥 إضافة التفاعلات هنا
    this.interactions = raw.interactions
      ? raw.interactions.map((i) => new ComplaintInteractionDto(i))
      : [];
  }

  private parse(field: string | string[] | null | undefined): string[] {
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

export type RawComplaint = {
  id: number;
  userId: number;
  governmentId: number;
  description: string;
  Location: string;
  type: string;
  documents: string | string[];
  images: string | string[];
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  user?: { id: number; name: string };
  government?: { id: number; name: string };

  // 🔥 أضف هذا
  interactions?: RawComplaintInteraction[];
};
