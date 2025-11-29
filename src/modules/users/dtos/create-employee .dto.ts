import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class CreateEmployeeDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Government ID this employee belongs to' })
  @IsNumber()
  @Type(() => Number)
  governmentId: number;
}
