import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateComplaintStatusDto {
@ApiProperty({ description: 'الحالة الجديدة للشكوى' })
@IsString()   
  status: string;
  
}
