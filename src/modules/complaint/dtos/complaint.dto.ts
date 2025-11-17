import { ApiProperty } from '@nestjs/swagger';

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
  type: string;

   @ApiProperty()
  documents: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(raw: RawComplaint) {
    this.id = raw.id;
    this.userId = raw.userId;
    this.governmentId = raw.governmentId;
    this.description = raw.description;
    this.type = raw.type;
    this.documents = raw.documents;
    this.createdAt = raw.createdAt; 
    this.updatedAt = raw.updatedAt;
   }
}

export type RawComplaint = {
  id: number;
  userId: number;
  governmentId: number;
  description: string;
  documents: string;
  type:string;
  createdAt: Date;
  updatedAt: Date;
};
