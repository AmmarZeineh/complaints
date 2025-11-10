import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class SearchDto {
  @ApiProperty({ description: 'The search keyword' })
  @IsString()
  @IsNotEmpty()
  search: string;

  @ApiProperty({ description: '1 = Users, 2 = Services, 3 = Jobs' })
  @IsInt()
  number: number;


}
