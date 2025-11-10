import { ApiProperty } from '@nestjs/swagger';
import { UserDto, RawUser } from '../../users/dtos/user.dto';

export class AuthDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty()
  fcmToken: string;


  constructor(raw: RawAuth) {
    this.accessToken = raw.token;
    this.user = new UserDto(raw.user);
    this.fcmToken=raw.fcmToken;

  }

}
export type RawAuth = {
  token: string;
  user: RawUser;
  fcmToken?: string;

};