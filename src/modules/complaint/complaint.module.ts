import { Module } from '@nestjs/common';
import { ComplaintGetterService } from './services/complaint-getter.service';
import { ComplaintCreatorService } from './services/complaint-creator.service';
import { ComplaintUpdaterService } from './services/complaint-updater.service';
import { ComplaintDeleteService } from './services/complaint-delete.service';
import { ComplaintApiService } from './controllers/complaint-api.service';
import { ComplaintController } from './controllers/complaint.controller';
import { CommonModule } from '../common/common.module';
import { EmailVerificationModule } from '../emailVerfication/EmailVerficationModule';
import { NotificationModule } from '../notification/notificationModule';
import { ComplaintHistoryService } from '../complaintHistory/services/complaintHistory-creator.service';
import { ComplaintHistoryModule } from '../complaintHistory/complaintHistory.module';

@Module({
  controllers: [ComplaintController],
  imports: [CommonModule,EmailVerificationModule,NotificationModule,ComplaintHistoryModule],
  providers: [
    ComplaintApiService,
    ComplaintCreatorService,
    ComplaintGetterService,
    ComplaintUpdaterService,
    ComplaintDeleteService,
    ComplaintHistoryService,
  ],
  exports: [
    ComplaintCreatorService,
    ComplaintGetterService,
    ComplaintUpdaterService,
    ComplaintDeleteService,
  ],
})
export class ComplaintModule {}
