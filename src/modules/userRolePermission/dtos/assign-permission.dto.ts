import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'معرف الدور',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty({ message: 'معرف الدور مطلوب' })
  @Type(() => Number)
  userRoleId: number;

  @ApiProperty({
    description: 'مصفوفة معرفات الصلاحيات',
    example: [1, 2, 3, 4],
    type: [Number],
    isArray: true
  })
  @IsArray({ message: 'يجب أن تكون permissionIds مصفوفة' })
  @ArrayMinSize(1, { message: 'يجب إضافة صلاحية واحدة على الأقل' })
  @IsNumber({}, { each: true, message: 'كل عنصر يجب أن يكون رقماً' })
  @Type(() => Number)
  permissionIds: number[];
}