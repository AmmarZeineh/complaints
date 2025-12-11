import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Res, 
  Query, 
  HttpStatus,
  HttpCode,
  BadRequestException 
} from '@nestjs/common';
import { BackupApiService } from './backup-api.service';
import { Response } from 'express';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupApi: BackupApiService) {}

  /**
   * تشغيل نسخ احتياطي يدويًا وإرجاع الملف ZIP للتحميل
   * POST /backup/run
   * 
   * Response: ملف ZIP يحتوي على:
   * - backup_YYYY-MM-DD.sql (قاعدة البيانات)
   * - uploads/ (المرفقات)
   */
  @Post('run')
  @HttpCode(HttpStatus.OK)
  async runManualBackup(@Res() res: Response) {
    try {
      const filePath = await this.backupApi.createBackup();
      const fileBuffer = await this.backupApi.getBackupFile(filePath);

      const fileName = filePath.split('/').pop() || 'backup.zip';

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      });

      return res.send(fileBuffer);

    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Backup creation failed',
        error: error.message,
      });
    }
  }

  /**
   * قائمة جميع النسخ الاحتياطية المتوفرة
   * GET /backup/list
   * 
   * Response Example:
   * {
   *   "statusCode": 200,
   *   "count": 3,
   *   "data": [
   *     {
   *       "filename": "backup_2025-01-15T03-00-00.zip",
   *       "size": "15.43 MB",
   *       "date": "2025-01-15T03:00:00.000Z"
   *     }
   *   ]
   * }
   */
  @Get('list')
  @HttpCode(HttpStatus.OK)
  async listBackups() {
    try {
      const backups = this.backupApi.listBackups();

      return {
        statusCode: HttpStatus.OK,
        count: backups.length,
        data: backups,
      };

    } catch (error) {
      throw new BadRequestException(`Failed to list backups: ${error.message}`);
    }
  }

  /**
   * تحميل نسخة احتياطية محددة
   * GET /backup/download?file=backup_2025-01-15T03-00-00.zip
   * 
   * Response: ملف ZIP للتحميل
   */
  @Get('download')
  @HttpCode(HttpStatus.OK)
  async downloadBackup(
    @Query('file') filename: string,
    @Res() res: Response
  ) {
    if (!filename) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Filename parameter is required',
      });
    }

    try {
      const filePath = `${process.cwd()}/db_backups/${filename}`;
      const fileBuffer = await this.backupApi.getBackupFile(filePath);

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      });

      return res.send(fileBuffer);

    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Backup file not found',
        error: error.message,
      });
    }
  }

  /**
   * استرجاع نسخة احتياطية محددة
   * POST /backup/restore?file=backup_2025-01-15T03-00-00.zip
   * 
   * ⚠️ تحذير: هذا سيستبدل قاعدة البيانات والمرفقات الحالية!
   * 
   * Response Example:
   * {
   *   "statusCode": 200,
   *   "message": "Backup restored successfully",
   *   "details": {
   *     "database": true,
   *     "uploads": true
   *   }
   * }
   */
  @Post('restore')
  @HttpCode(HttpStatus.OK)
  async restoreBackup(@Query('file') filename: string) {
    if (!filename) {
      throw new BadRequestException('Filename parameter is required');
    }

    try {
      const result = await this.backupApi.restoreBackup(filename);

      return {
        statusCode: HttpStatus.OK,
        ...result,
      };

    } catch (error) {
      throw new BadRequestException(`Restore failed: ${error.message}`);
    }
  }

  /**
   * حذف نسخة احتياطية محددة
   * DELETE /backup/delete?file=backup_2025-01-15T03-00-00.zip
   * 
   * Response Example:
   * {
   *   "statusCode": 200,
   *   "message": "Backup deleted successfully"
   * }
   */
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  async deleteBackup(@Query('file') filename: string) {
    if (!filename) {
      throw new BadRequestException('Filename parameter is required');
    }

    try {
      const result = await this.backupApi.deleteBackup(filename);

      return {
        statusCode: HttpStatus.OK,
        ...result,
      };

    } catch (error) {
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }
}