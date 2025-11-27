import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  
  @ApiProperty()
  @IsOptional()
  @IsString() 
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString() 
  nationalID?: string;
}

  
