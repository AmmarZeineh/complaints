import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './controllers/auth.controller';
import { AuthApiService } from './controllers/auth-api.service';
import { AuthLoginService } from './services/auth-login.service';
import { UserModule } from '../users/user.module';

import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notificationModule';
// import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    

    }),
    UserModule,
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthApiService,
    AuthLoginService,
    LocalStrategy,
    JwtStrategy,
  ],
   exports: [PassportModule, JwtModule],
})
export class AuthModule {}
