import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'اسم الدور',
    example: 'موظف حكومي',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'اسم الدور يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم الدور مطلوب' })
  @MinLength(2, { message: 'اسم الدور يجب أن يكون على الأقل حرفين' })
  @MaxLength(100, { message: 'اسم الدور يجب ألا يتجاوز 100 حرف' })
  name: string;
}