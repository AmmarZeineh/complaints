import { Injectable } from '@nestjs/common';
import { AuthLoginService } from '../services/auth-login.service';
import { LoginDto } from '../dtos/login.dto';
import { AuthDto } from '../dtos/auth.dto';

@Injectable()
export class AuthApiService {
  constructor(private readonly _authLogin: AuthLoginService) {}

  async login(data: LoginDto): Promise<AuthDto> { 
    const raw = await this._authLogin.login(data.email,data.fcmToken);
    return new AuthDto(raw);
  }
}
