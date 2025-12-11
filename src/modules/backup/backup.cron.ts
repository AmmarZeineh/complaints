import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupCron {
  private readonly logger = new Logger(BackupCron.name);

  constructor(private readonly backupService: BackupService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async dailyBackup() {
    this.logger.log('Running scheduled daily backup...');
    await this.backupService.createBackup();
  }
}
