import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateComplaintDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  Location?: string;

  @ApiProperty({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'صور جديدة للإضافة'
  })
  @IsOptional()
  images?: any[];

  @ApiProperty({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
    description: 'ملفات جديدة للإضافة'
  })
  @IsOptional()
  documents?: any[];

  @ApiProperty({ 
    required: false,
    type: 'array',
    items: { type: 'string' },
    description: 'أسماء الصور المراد حذفها',
    example: ['1234567890_image.jpg']
  })
  @IsOptional()
  imagesToDelete?: string[];

  @ApiProperty({ 
    required: false,
    type: 'array',
    items: { type: 'string' },
    description: 'أسماء الملفات المراد حذفها',
    example: ['1234567890_document.pdf']
  })
  @IsOptional()
  documentsToDelete?: string[];

  @ApiProperty({ 
    required: false,
    description: 'حذف جميع الصور',
    type: 'boolean'
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  deleteAllImages?: boolean;

  @ApiProperty({ 
    required: false,
    description: 'حذف جميع الملفات',
    type: 'boolean'
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  deleteAllDocuments?: boolean;
}