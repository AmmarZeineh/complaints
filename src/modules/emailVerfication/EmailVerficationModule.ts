// src/modules/email-verification/email-verification.module.ts
import { Module } from '@nestjs/common';
import { EmailVerificationService } from './EmailVerificationService';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '../../common/mail/mail.module';
import { EmailVerificationController } from './EmailVerficationController';

@Module({
  imports: [PrismaModule, MailerModule],
  providers: [EmailVerificationService],
    controllers: [EmailVerificationController],
  exports: [EmailVerificationService], 
})
export class EmailVerificationModule {}
