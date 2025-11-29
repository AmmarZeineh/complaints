import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateComplaintDto {
  @ApiPropertyOptional({ description: 'وصف الشكوى' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'نوع الشكوى' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'موقع الشكوى' })
  @IsString()
  @IsOptional()
  Location?: string;

  // ✅ حذف كل الصور
  @ApiPropertyOptional({ 
    description: 'حذف كل الصور (true/false)',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  deleteAllImages?: boolean;

  // ✅ حذف صور محددة (URLs)
  @ApiPropertyOptional({ 
    description: 'روابط الصور المراد حذفها',
    type: [String],
    example: ['http://localhost:3000/uploads/2/complaints/7/images/123_0_image.png'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim());
    }
    return value;
  })
  imagesToDelete?: string[];

  // ✅ حذف كل المستندات
  @ApiPropertyOptional({ 
    description: 'حذف كل المستندات (true/false)',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  deleteAllDocuments?: boolean;

  // ✅ حذف مستندات محددة (URLs)
  @ApiPropertyOptional({ 
    description: 'روابط المستندات المراد حذفها',
    type: [String],
    example: ['http://localhost:3000/uploads/2/complaints/7/documents/456_0_report.pdf'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(v => v.trim());
    }
    return value;
  })
  documentsToDelete?: string[];

  // ✅ صور جديدة (يتم رفعها)
  @ApiPropertyOptional({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'صور جديدة (حد أقصى 10 صور)',
  })
  images?: Express.Multer.File[];

  // ✅ مستندات جديدة (يتم رفعها)
  @ApiPropertyOptional({ 
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'مستندات جديدة (حد أقصى 5 ملفات)',
  })
  documents?: Express.Multer.File[];
}