// src/modules/email-verification/email-verification.module.ts
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationController } from './notificationController';

@Module({
  imports: [PrismaModule],
  providers: [NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService], 
})
export class NotificationModule {}
