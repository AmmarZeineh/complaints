import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({
    description: 'اسم الدور',
    example: 'موظف حكومي محدث',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'اسم الدور يجب أن يكون نصاً' })
  @IsOptional()
  @MinLength(2, { message: 'اسم الدور يجب أن يكون على الأقل حرفين' })
  @MaxLength(100, { message: 'اسم الدور يجب ألا يتجاوز 100 حرف' })
  name?: string;
}