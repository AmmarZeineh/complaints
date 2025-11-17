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

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  @IsOptional()
  documents?: any; 

  @ApiProperty()
  @IsString()
  type: string;

}
