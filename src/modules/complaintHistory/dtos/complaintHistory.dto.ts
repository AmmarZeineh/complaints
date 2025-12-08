// modules/complaint/dtos/complaint-history.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { HistoryAction, InteractionType } from '@prisma/client';

// ✅ DTO للتفاعل مع الملفات
export class InteractionDetailsDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: InteractionType })
  type: InteractionType;

  @ApiProperty()
  message: string;

  @ApiProperty()
  senderId: number;

  @ApiProperty({ required: false })
  receiverId?: number;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ type: [String] })
  documents: string[];

  @ApiProperty()
  createdAt: Date;
}

export class ComplaintHistoryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  complaintId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: HistoryAction })
  action: HistoryAction;

  @ApiProperty({ required: false })
  oldValue?: any;

  @ApiProperty({ required: false })
  newValue?: any;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  user?: {
    id: number;
    name: string;
  };

  // ✅ إضافة التفاعل مع الملفات
  @ApiProperty({ type: InteractionDetailsDto, required: false })
  interaction?: InteractionDetailsDto;

  constructor(raw: RawComplaintHistory) {
    this.id = raw.id;
    this.complaintId = raw.complaintId;
    this.userId = raw.userId;
    this.action = raw.action;
    this.oldValue = this.parseJson(raw.oldValue);
    this.newValue = this.parseJson(raw.newValue);
    this.description = raw.description;
    this.metadata = raw.metadata;
    this.createdAt = raw.createdAt;
    this.user = raw.user;
    
    // ✅ إضافة التفاعل إذا كان موجوداً
    if (raw.interaction) {
      this.interaction = raw.interaction;
    }
  }

  private parseJson(value: string | null | undefined): any {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
}

export type RawComplaintHistory = {
  id: number;
  complaintId: number;
  userId: number;
  action: HistoryAction;
  oldValue?: string | null;
  newValue?: string | null;
  description: string;
  metadata?: any;
  createdAt: Date;
  user?: {
    id: number;
    name: string;
  };
  // ✅ إضافة التفاعل
  interaction?: {
    id: number;
    type: InteractionType;
    message: string;
    senderId: number;
    receiverId?: number;
    images: string[];
    documents: string[];
    createdAt: Date;
  };
};
