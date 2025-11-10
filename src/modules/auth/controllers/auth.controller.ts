import { Controller, Post, UseGuards, Body } from '@nestjs/common';
import { AuthApiService } from './auth-api.service';
import { LoginDto } from '../dtos/login.dto';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ApiResponse } from '@nestjs/swagger';
import { AuthDto } from '../dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authApiService: AuthApiService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiResponse({ type: AuthDto  })
  async login(@Body() loginDto: LoginDto) {
    return this._authApiService.login(loginDto);
  }

  @Post('logout')
  logout() {
    return { message: 'Successfully logged out' };
  }
}