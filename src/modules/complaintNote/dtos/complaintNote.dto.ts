// dtos/complaintNote.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ComplaintNoteDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  complaintId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  user?: {
    id: number;
    name: string;
  };

  @ApiPropertyOptional()
  complaint?: {
    id: number;
    description: string;
  };

  constructor(raw: RawComplaintNote) {
    this.id = raw.id;
    this.complaintId = raw.complaintId;
    this.userId = raw.userId;
    this.content = raw.content;
    this.createdAt = raw.createdAt;
    this.updatedAt = raw.updatedAt;
    this.user = raw.user;
    this.complaint = raw.complaint;
  }
}

export type RawComplaintNote = {
  id: number;
  complaintId: number;
  userId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    name: string;
  };
  complaint?: {
    id: number;
    description: string;
  };
};