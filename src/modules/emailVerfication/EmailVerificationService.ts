// email-verification.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { MailerService } from 'src/common/mail/mail.service'; 

@Injectable()
export class EmailVerificationService {
  constructor(
    private prisma: PrismaService,
    private mailer: MailerService,
  ) {}

async sendVerificationCode(email: string): Promise<boolean> {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) return false;

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
 
  await this.prisma.emailVerification.deleteMany({ where: { email } });

  await this.prisma.emailVerification.create({
    data: { email, code, expiresAt },
  });

  await this.mailer.sendVerificationCode(email, code);
  return true;
}


  async verifyCode(email: string, submittedCode: string): Promise<boolean> {
    const record = await this.prisma.emailVerification.findFirst({
      where: { email, code: submittedCode },
    });

    if (!record || record.expiresAt < new Date()) return false;

    await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true },
    });

    await this.prisma.emailVerification.delete({ where: { id: record.id } });
    return true;
  }
}
