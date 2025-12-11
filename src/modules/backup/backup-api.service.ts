import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BackupService } from './backup.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';

const execPromise = promisify(exec);

@Injectable()
export class BackupApiService {
  private readonly logger = new Logger(BackupApiService.name);
  private readonly backupDir = path.join(process.cwd(), 'db_backups');
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly backupService: BackupService) {}

  /**
   * إنشاء نسخة احتياطية جديدة
   */
  async createBackup(): Promise<string> {
    return await this.backupService.createBackup();
  }

  /**
   * قراءة ملف النسخة الاحتياطية
   */
  async getBackupFile(filePath: string): Promise<Buffer> {
    return this.backupService.getBackupFile(filePath);
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  listBackups() {
    return this.backupService.listBackups();
  }

  /**
   * استرجاع نسخة احتياطية كاملة (قاعدة البيانات + المرفقات)
   */
  async restoreBackup(filename: string): Promise<{ 
    message: string; 
    details: { database: boolean; uploads: boolean } 
  }> {
    try {
      // 1️⃣ التحقق من صحة اسم الملف
      this.backupService.validateFilename(filename);

      const backupPath = path.join(this.backupDir, filename);

      if (!fs.existsSync(backupPath)) {
        throw new BadRequestException('Backup file not found');
      }

      this.logger.log(`🔄 Starting restore from: ${filename}`);

      // 2️⃣ فك الضغط
      const extractDir = path.join(this.backupDir, 'temp_extract');
      if (fs.existsSync(extractDir)) {
        fs.rmSync(extractDir, { recursive: true });
      }
      fs.mkdirSync(extractDir, { recursive: true });

      const zip = new AdmZip(backupPath);
      zip.extractAllTo(extractDir, true);

      // 3️⃣ استرجاع قاعدة البيانات
      const sqlFile = fs.readdirSync(extractDir).find(f => f.endsWith('.sql'));
      if (!sqlFile) {
        throw new Error('SQL file not found in backup');
      }

      const sqlFilePath = path.join(extractDir, sqlFile);
      await this.restoreDatabase(sqlFilePath);

      // 4️⃣ استرجاع المرفقات
      let uploadsRestored = false;
      const uploadsBackupPath = path.join(extractDir, 'uploads');
      
      if (fs.existsSync(uploadsBackupPath)) {
        uploadsRestored = await this.restoreUploads(uploadsBackupPath);
      }

      // 5️⃣ تنظيف الملفات المؤقتة
      fs.rmSync(extractDir, { recursive: true });

      this.logger.log('✅ Restore completed successfully');

      return {
        message: 'Backup restored successfully',
        details: {
          database: true,
          uploads: uploadsRestored,
        },
      };

    } catch (error) {
      this.logger.error('❌ Restore failed', error.message);
      throw new BadRequestException(`Restore failed: ${error.message}`);
    }
  }

  /**
   * استرجاع قاعدة البيانات من ملف SQL
   */
  private async restoreDatabase(sqlFilePath: string): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL is missing from .env');
    }

    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = dbUrl.match(regex);

    if (!match) {
      throw new Error('Invalid DATABASE_URL format. Expected: mysql://user:pass@host:port/dbname');
    }

    const [, user, pass, host, port, database] = match;

    // إنشاء ملف credentials مؤقت (أكثر أماناً)
    const credentialsFile = path.join(this.backupDir, '.restore.cnf');
    const credentialsContent = `[client]\nuser=${user}\npassword=${pass}\nhost=${host}\nport=${port}`;
    
    fs.writeFileSync(credentialsFile, credentialsContent, { mode: 0o600 });

    try {
      this.logger.log(`📥 Restoring database: ${database}`);

      // استخدام ملف credentials بدلاً من كلمة المرور في الأمر
      const CMD = `mysql --defaults-extra-file="${credentialsFile}" ${database} < "${sqlFilePath}"`;
      
      const { stderr } = await execPromise(CMD);

      // MySQL يطبع warnings في stderr حتى عند النجاح
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(stderr);
      }

      this.logger.log('✅ Database restored successfully');

    } finally {
      // حذف ملف credentials في جميع الحالات
      if (fs.existsSync(credentialsFile)) {
        fs.unlinkSync(credentialsFile);
      }
    }
  }

  /**
   * استرجاع المرفقات (الصور والملفات)
   */
  private async restoreUploads(sourceDir: string): Promise<boolean> {
    try {
      this.logger.log('📁 Restoring uploads folder...');

      // نسخ احتياطي للمرفقات القديمة قبل الاستبدال
      if (fs.existsSync(this.uploadsDir)) {
        const backupOldUploads = `${this.uploadsDir}_backup_${Date.now()}`;
        fs.renameSync(this.uploadsDir, backupOldUploads);
        this.logger.warn(`⚠️ Old uploads backed up to: ${backupOldUploads}`);
      }

      // نسخ المرفقات الجديدة
      this.copyRecursiveSync(sourceDir, this.uploadsDir);

      this.logger.log('✅ Uploads restored successfully');
      return true;

    } catch (error) {
      this.logger.error('❌ Failed to restore uploads', error.message);
      return false;
    }
  }

  /**
   * نسخ مجلد بشكل متكرر (recursive copy)
   */
  private copyRecursiveSync(src: string, dest: string): void {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyRecursiveSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * حذف نسخة احتياطية محددة
   */
  async deleteBackup(filename: string): Promise<{ message: string }> {
    try {
      // التحقق من صحة اسم الملف
      this.backupService.validateFilename(filename);

      const filePath = path.join(this.backupDir, filename);

      if (!fs.existsSync(filePath)) {
        throw new BadRequestException('Backup file not found');
      }

      fs.unlinkSync(filePath);
      this.logger.log(`🗑️ Deleted backup: ${filename}`);

      return { message: 'Backup deleted successfully' };

    } catch (error) {
      this.logger.error('❌ Failed to delete backup', error.message);
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }
}