import { ApiProperty } from '@nestjs/swagger';export class ComplaintDto {
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
  images: string[];

  @ApiProperty({ type: [String] })
  documents: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(raw: RawComplaint) {
    this.id = raw.id;
    this.userId = raw.userId;
    this.governmentId = raw.governmentId;
    this.description = raw.description;
    this.Location = raw.Location;
    this.type = raw.type;
    
    // تحويل JSON string إلى array
    this.images = raw.images ? JSON.parse(raw.images) : [];
    this.documents = raw.documents ? JSON.parse(raw.documents) : [];
    
    this.createdAt = raw.createdAt;
    this.updatedAt = raw.updatedAt;
  }
}

export type RawComplaint = {
  id: number;
  userId: number;
  governmentId: number;
  description: string;
  Location: string;
  type: string;
  images: string | null;     // JSON string من قاعدة البيانات
  documents: string | null;  // JSON string من قاعدة البيانات
  createdAt: Date;
  updatedAt: Date;
};
