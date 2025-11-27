import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  IsNumber,
  IsOptional,
} from 'class-validator';


export class CreateComplaintDto {
  @IsNumber()
  @ApiProperty()
  @Type(() => Number)
  governmentId: number;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  Location: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'يمكن رفع حتى 10 صور (JPG, PNG, GIF) - حجم أقصى 5MB لكل صورة'
  })
  @IsOptional()
  images?: any[];

  @ApiProperty({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'يمكن رفع حتى 5 ملفات (PDF, DOCX, XLSX) - حجم أقصى 10MB لكل ملف'
  })
  @IsOptional()
  documents?: any[];
}