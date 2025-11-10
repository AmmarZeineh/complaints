import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserGetterService } from 'src/modules/users/services/user-getter.service';
import * as bcrypt from 'bcrypt';
import { RawUser } from 'src/modules/users/dtos/user.dto';
import { RawAuth } from '../dtos/auth.dto';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly userGetter: UserGetterService,
    private readonly jwtService: JwtService,
    private readonly _prisma: PrismaService,

  ) {}
async validateUser(email: string, password: string): Promise<RawUser> {
    const user = await this.userGetter.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني غير موجود'); // 1
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة'); // 2
    }

    const isPrivileged = user.roleId === 3;
    if (!isPrivileged && !user.isEmailVerified) {
      throw new BadRequestException('يجب تفعيل البريد الإلكتروني أولاً'); // 3
    }

    const { password: _pw, ...safeUser } = user;
    return safeUser;
  }

  async login(email: string , fcmToken?:string  ): Promise<RawAuth> {
    const user = await this.userGetter.findByEmail(email);
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {   expiresIn: '365d' });
  if (fcmToken) {
    await this._prisma.userToken.upsert({
      where: { fcmToken }, 
      update: { updatedAt: new Date() },
      create: {
        userId: user.id,
        fcmToken,
      },
    });
  }




  

    return {
      token,
      user,
      fcmToken,
    };
  }
}
