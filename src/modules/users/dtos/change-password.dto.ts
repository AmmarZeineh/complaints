import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @ApiProperty()
  oldPassword: string;

  @IsString()
  @ApiProperty()
  @MinLength(6)
  newPassword: string;
}
