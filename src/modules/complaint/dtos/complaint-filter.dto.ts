import { ApiPropertyOptional } from '@nestjs/swagger';
import { Status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'src/common/filter/search.dto';

export class ComplaintFilterDto extends SearchDto {
   @ApiPropertyOptional({
    enum: Status,
    description: 'Complaint status filter',
  })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
