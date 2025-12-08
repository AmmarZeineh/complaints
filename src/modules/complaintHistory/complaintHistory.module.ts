import { Module } from '@nestjs/common';
import { ComplaintHistoryService } from './services/complaintHistory-creator.service';
import { ComplaintHistoryGetterService } from './services/complaintHistory-getter.service';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ComplaintHistoryController } from './controllers/complaintHistory.controller';
import { ComplaintHistoryApiService } from './controllers/complaintHistory-api.service';
import { ComplaintHistoryExportService } from './services/complaintHistory-export.service';

@Module({
  imports: [CommonModule,PrismaModule],
  controllers: [ComplaintHistoryController],
  providers: [
    ComplaintHistoryApiService,
    ComplaintHistoryService,
    ComplaintHistoryGetterService,
    ComplaintHistoryExportService,
  ],
  exports: [
    ComplaintHistoryApiService,
    ComplaintHistoryService,
    ComplaintHistoryGetterService,
  ],
})
export class ComplaintHistoryModule {}
