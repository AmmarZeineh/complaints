import { ApiProperty } from '@nestjs/swagger';
import { GovernmentDto, RawGovernment } from 'src/modules/government/dtos/government.dto';

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

  @ApiProperty()
 failedLoginAttempts: number;

  @ApiProperty()
  lockedUntil: Date;

  @ApiProperty()
  lastLoginAttemptAt: Date;


  @ApiProperty()
  governmentId: number;

  @ApiProperty({ required: false, type: () => GovernmentDto })
  government?: GovernmentDto; 

  constructor(raw: RawUser) {
    this.id = raw.id;
    this.name = raw.name;
    this.nationalID = raw.nationalID;
    this.email=raw.email;
    this.createdAt = raw.createdAt; 
    this.updatedAt = raw.updatedAt;
    this.isEmailVerified=raw.isEmailVerified;
    this.roleId=raw.roleId;
    this.governmentId=raw.governmentId;
    this.failedLoginAttempts=raw.failedLoginAttempts;
    this.lastLoginAttemptAt=raw.lastLoginAttemptAt;
    this.lockedUntil=raw.lockedUntil;
    this.government = raw.government
      ? new GovernmentDto(raw.government)
      : undefined;
   }
}

export type RawUser = {
  id: number;
  name: string;
  nationalID: string | null;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  isEmailVerified: boolean;
  roleId: number;
  governmentId: number;
  failedLoginAttempts: number;
  lockedUntil:         Date;
  lastLoginAttemptAt:  Date;

  government?: RawGovernment | null; 
};


export type RawUserWithPassword = RawUser & {
  password: string;
};