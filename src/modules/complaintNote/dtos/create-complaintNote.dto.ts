import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CreateComplaintNoteDto {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  complaintId: number;

  @ApiProperty({
    minLength: 10,
    maxLength: 2000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}