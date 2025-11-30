import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'اسم الصلاحية',
    example: 'UPDATE_COMPLAINT',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name?: string;
}