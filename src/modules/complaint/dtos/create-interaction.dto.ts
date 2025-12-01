import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { InteractionType } from '@prisma/client';

export class CreateInteractionDto {
  @IsNumber()
  @ApiProperty()
  @Type(() => Number)
  complaintId: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => Number)
  receiverId?: number;

  @ApiProperty()
  @IsString()
  message: string;

  @IsEnum(InteractionType)
  @ApiProperty({ enum: InteractionType })
  type: InteractionType;

  @ApiPropertyOptional({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'يمكن رفع حتى 10 صور (JPG, PNG, GIF) - حجم أقصى 5MB لكل صورة'
  })
  @IsOptional()
  images?: any[];

  @ApiPropertyOptional({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'يمكن رفع حتى 5 ملفات (PDF, DOCX, XLSX) - حجم أقصى 10MB لكل ملف'
  })
  @IsOptional()
  documents?: any[];
}