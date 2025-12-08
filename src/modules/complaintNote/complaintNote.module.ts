import { Module } from '@nestjs/common';
import { ComplaintNoteController } from './controllers/complaintNote.controller';
import { ComplaintNoteApiService } from './controllers/complaintNote-api.service';
import { ComplaintNoteCreatorService } from './services/complaintNote-creator.service';
import { ComplaintNoteGetterService } from './services/complaintNote-getter.service';
import { ComplaintNoteUpdaterService } from './services/complaintNote-updater.service';
import { ComplaintNoteDeleterService } from './services/complaintNote-deleter.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserModule } from '../users/user.module';
import { ComplaintNoteRepository } from './repositories/complaintNote.repository';
import { ComplaintHistoryModule } from '../complaintHistory/complaintHistory.module';
import { ComplaintHistoryService } from '../complaintHistory/services/complaintHistory-creator.service';

@Module({
  imports: [PrismaModule,UserModule,ComplaintHistoryModule],
  controllers: [ComplaintNoteController],
  providers: [
    ComplaintNoteApiService,
    ComplaintNoteRepository,
    ComplaintNoteCreatorService,
    ComplaintNoteGetterService,
    ComplaintNoteUpdaterService,
    ComplaintNoteDeleterService,
    ComplaintHistoryService,
  ],
  exports: [ComplaintNoteApiService],
})
export class ComplaintNoteModule {}