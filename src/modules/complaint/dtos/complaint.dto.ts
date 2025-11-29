import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

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

   @ApiProperty()
  documents: string;

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
    this.documents = raw.documents;
    this.status = raw.status;
    this.createdAt = raw.createdAt; 
    this.updatedAt = raw.updatedAt;
    this.user = raw.user;
    this.government = raw.government;
   }
}

export type RawComplaint = {
  id: number;
  userId: number;
  governmentId: number;
  description: string;
  Location:string;
  documents: string;
  status: Status;
  type:string;
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
