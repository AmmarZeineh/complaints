import { Module } from '@nestjs/common';
import { GovernmentGetterService } from './services/government-getter.service';
import { GovernmentCreatorService } from './services/government-creator.service';
import { GovernmentUpdaterService } from './services/government-updater.service';
import { GovernmentDeleteService } from './services/government-delete.service';
import { GovernmentApiService } from './controllers/government-api.service';
import { GovernmentController } from './controllers/government.controller';
import { CommonModule } from '../common/common.module';
import { EmailVerificationModule } from '../emailVerfication/EmailVerficationModule';

@Module({
  controllers: [GovernmentController],
  imports: [CommonModule,EmailVerificationModule],
  providers: [
    GovernmentApiService,
    GovernmentGetterService,
    GovernmentCreatorService,
    GovernmentUpdaterService,
    GovernmentDeleteService,
  ],
  exports: [
    GovernmentGetterService,
    GovernmentCreatorService,
    GovernmentUpdaterService,
    GovernmentDeleteService,
  ],
})
export class GivernmentModule {}
