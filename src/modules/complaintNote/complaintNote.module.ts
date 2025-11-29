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

@Module({
  imports: [PrismaModule,UserModule],
  controllers: [ComplaintNoteController],
  providers: [
    ComplaintNoteApiService,
    ComplaintNoteRepository,
    ComplaintNoteCreatorService,
    ComplaintNoteGetterService,
    ComplaintNoteUpdaterService,
    ComplaintNoteDeleterService,
  ],
  exports: [ComplaintNoteApiService],
})
export class ComplaintNoteModule {}