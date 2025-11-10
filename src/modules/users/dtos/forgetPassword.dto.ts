import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgetPasswordDto {

   @ApiProperty()
   @IsEmail()
   email: string;

   @ApiProperty()
   @IsString()
   newPassword:string;
}
