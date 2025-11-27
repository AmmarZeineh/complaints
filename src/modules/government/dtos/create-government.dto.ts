import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
} from 'class-validator';

export class CreateGovernmentDto {
  @ApiProperty()
  @IsString()
  name: string;
}
