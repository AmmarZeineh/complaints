import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nationalID: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  email: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  roleId: number;



  constructor(raw: RawUser) {
    this.id = raw.id;
    this.name = raw.name;
    this.nationalID = raw.nationalID;
    this.email=raw.email;
    this.createdAt = raw.createdAt; 
    this.updatedAt = raw.updatedAt;
    this.isEmailVerified=raw.isEmailVerified;
    this.roleId=raw.roleId;
   }
}

export type RawUser = Omit<UserDto, 'password'> & {
};


export type RawUserWithPassword = RawUser & {
  password: string;
};