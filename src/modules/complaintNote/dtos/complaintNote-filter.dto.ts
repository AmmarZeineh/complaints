// dtos/complaintNote-filter.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { SearchDto } from 'src/common/filter/search.dto';

export class ComplaintNoteFilterDto extends SearchDto {
  @ApiPropertyOptional({ description: 'تصفية حسب معرف الشكوى' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  complaintId?: number;

  @ApiPropertyOptional({ description: 'تصفية حسب معرف الموظف' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;
}