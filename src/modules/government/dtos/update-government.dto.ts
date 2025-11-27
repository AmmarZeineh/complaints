import { ApiProperty } from '@nestjs/swagger';
import {  IsOptional, IsString } from 'class-validator';



export class UpdateGovernmentDto {
  @ApiProperty()
  @IsOptional()
  @IsString() 
  name: string;
}

  
