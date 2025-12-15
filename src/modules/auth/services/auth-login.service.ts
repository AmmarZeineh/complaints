import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserGetterService } from 'src/modules/users/services/user-getter.service';
import * as bcrypt from 'bcrypt';
import { RawUser } from 'src/modules/users/dtos/user.dto';
import { RawAuth } from '../dtos/auth.dto';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { NotificationService } from 'src/modules/notification/notification.service';

const MAX_FAILED_ATTEMPTS = 5;      // بعد كم محاولة يفشل يقفل؟
const LOCK_TIME_MINUTES = 15;       // مدة قفل الحساب (دقائق)
const LOGIN_COOLDOWN_MS = 3000;     // أقل فترة بين محاولتي دخول لنفس الحساب (ms)
const FAILED_ATTEMPTS_RESET_MINUTES = 30; //إذا مرّ 30 دقيقة بدون محاولات فاشلة

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly userGetter: UserGetterService,
    private readonly jwtService: JwtService,
    private readonly _prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async validateUser(email: string, password: string): Promise<RawUser> {
    const user = await this.userGetter.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني غير موجود');
    }

    const now = new Date();

    // 1️⃣ هل الحساب مقفول حاليًا؟
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new UnauthorizedException(
        `تم قفل حسابك مؤقتًا حتى ${user.lockedUntil.toLocaleString('ar-SA')}`,
      );
    }

    // 2️⃣ منع الإدخال المتكرر السريع (brute force على نفس الحساب)
    if (
      user.lastLoginAttemptAt &&
      now.getTime() - user.lastLoginAttemptAt.getTime() < LOGIN_COOLDOWN_MS
    ) {
      throw new UnauthorizedException(
        'محاولات متكررة بسرعة عالية، الرجاء الانتظار بضع ثوانٍ قبل المحاولة مجددًا',
      );
    }

    // 3️⃣ التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
     // قبل زيادة العداد
     let failedCount = user.failedLoginAttempts;

if (
  user.lastFailedLoginAt &&
  now.getTime() - user.lastFailedLoginAt.getTime() >
    FAILED_ATTEMPTS_RESET_MINUTES * 60 * 1000
) {
  failedCount = 0;
}

failedCount += 1;
     

      // زيادة عداد المحاولات الفاشلة + تحديث وقت المحاولة
      // const failedCount = user.failedLoginAttempts + 1;

      let lockedUntil: Date | null = null;
      let resetFailedToZero = false;

      if (failedCount >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(
          now.getTime() + LOCK_TIME_MINUTES * 60 * 1000,
        );
        resetFailedToZero = true;

            const title = 'قفل الحساب مؤقتًا';
    const body = `تم قفل حسابك مؤقتًا لمدة ${LOCK_TIME_MINUTES} دقيقة بسبب تعدد محاولات الدخول غير الناجحة.`;

        // 4️⃣ إنشاء إشعار في جدول Notification
        await this._prisma.notification.create({
          data: {
            userId: user.id,
            title,
            body,
            type: 'ACCOUNT_LOCKED',
            data: {
              failedAttempts: failedCount,
              lockedUntil,
            },
          },
        });

     // إرسال الإشعار عبر FCM
  const tokens = await this._prisma.userToken.findMany({
    where: { userId: user.id },
  });

  for (const t of tokens) {
    await this.notificationService.sendNotification(t.fcmToken, title, body);
  }}
      await this._prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: resetFailedToZero ? 0 : failedCount,
          lockedUntil,
          lastLoginAttemptAt: now,
          lastFailedLoginAt: now,
        },
      });

      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    // 5️⃣ لو كلمة المرور صحيحة → إعادة تعيين العداد وفتح الحساب إن كان مقفولاً
    await this._prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAttemptAt: now,
        lastFailedLoginAt: null,
      },
    });

    // التحقق من تفعيل البريد حسب منطقك السابق
    const isPrivileged = user.roleId === 3;
    if (!isPrivileged && !user.isEmailVerified) {
      throw new BadRequestException('يجب تفعيل البريد الإلكتروني أولاً');
    }

    const { password: _pw, ...safeUser } = user;
    return safeUser;
  }

  async login(email: string, fcmToken?: string): Promise<RawAuth> {
    const user = await this.userGetter.findByEmail(email);

    // تأكد أيضًا في login أن الحساب ليس مقفولاً (للحماية لو تم تجاوز validateUser)
    const now = new Date();
    if (user.lockedUntil && user.lockedUntil > now) {
      throw new UnauthorizedException(
        `تم قفل حسابك مؤقتًا حتى ${user.lockedUntil.toLocaleString('ar-SA')}`,
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      roleId: user.roleId,
    };
    const token = this.jwtService.sign(payload, { expiresIn: '365d' });

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
