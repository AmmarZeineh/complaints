import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { BackupApiService } from './backup-api.service';
import { BackupController } from './backup.controller';
import { BackupCron } from './backup.cron';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [BackupController],
  providers: [BackupService, BackupApiService, BackupCron],
})
export class BackupModule {}
