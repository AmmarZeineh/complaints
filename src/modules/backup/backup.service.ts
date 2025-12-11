import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';

const archiver = require('archiver');
const execPromise = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'db_backups');
  private readonly uploadsDir = path.join(process.cwd(), 'uploads'); // مجلد المرفقات
  private readonly maxBackups = 5;

  private readonly dbUser: string;
  private readonly dbPass: string;
  private readonly dbHost: string;
  private readonly dbPort: string;
  private readonly dbName: string;

  constructor() {
    // إنشاء المجلدات إن لم تكن موجودة
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // استخراج بيانات الاتصال
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is missing from .env');
    }

    // Regex صحيح لـ MySQL URL
    const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = dbUrl.match(regex);

    if (!match) {
      throw new Error('DATABASE_URL format invalid. Expected: mysql://user:pass@host:port/dbname');
    }

    this.dbUser = match[1];
    this.dbPass = match[2];
    this.dbHost = match[3];
    this.dbPort = match[4];
    this.dbName = match[5];

    this.logger.log(`Backup service initialized for database: ${this.dbName}`);
  }

  /**
   * إنشاء نسخة احتياطية كاملة (قاعدة البيانات + المرفقات)
   */
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbFileName = `backup_${timestamp}.sql`;
    const zipFileName = `backup_${timestamp}.zip`;
    
    const dbFilePath = path.join(this.backupDir, dbFileName);
    const zipFilePath = path.join(this.backupDir, zipFileName);

    try {
      // 1️⃣ نسخ قاعدة البيانات
      await this.backupDatabase(dbFilePath);

      // 2️⃣ ضغط القاعدة + المرفقات في ملف ZIP
      await this.createZipArchive(zipFilePath, dbFilePath);

      // 3️⃣ حذف ملف SQL المؤقت
      fs.unlinkSync(dbFilePath);

      // 4️⃣ تنظيف النسخ القديمة
      this.cleanupOldBackups();

      this.logger.log(`✅ Backup completed: ${zipFileName}`);
      return zipFilePath;

    } catch (error) {
      this.logger.error('❌ Backup failed', error.message);
      
      // تنظيف الملفات المؤقتة عند الفشل
      if (fs.existsSync(dbFilePath)) fs.unlinkSync(dbFilePath);
      if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
      
      throw error;
    }
  }

  /**
   * نسخ قاعدة البيانات فقط
   */
  private async backupDatabase(filePath: string): Promise<void> {
    // استخدام ملف مؤقت لكلمة المرور (أكثر أماناً)
    const credentialsFile = path.join(this.backupDir, '.my.cnf');
    const credentialsContent = `[client]\nuser=${this.dbUser}\npassword=${this.dbPass}\nhost=${this.dbHost}\nport=${this.dbPort}`;
    
    fs.writeFileSync(credentialsFile, credentialsContent, { mode: 0o600 });

    try {
      const CMD = `mysqldump --defaults-extra-file="${credentialsFile}" --single-transaction --quick --lock-tables=false ${this.dbName} > "${filePath}"`;
      
      this.logger.log(`📦 Starting database backup: ${this.dbName}`);
      
      const { stderr } = await execPromise(CMD);
      
      if (stderr && !stderr.includes('Warning')) {
        throw new Error(stderr);
      }

      this.logger.log('✅ Database backup completed');

    } finally {
      // حذف ملف كلمة المرور
      if (fs.existsSync(credentialsFile)) {
        fs.unlinkSync(credentialsFile);
      }
    }
  }

  /**
   * ضغط القاعدة + المرفقات في ZIP
   */
private async createZipArchive(zipPath: string, dbFilePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      this.logger.log(`📦 ZIP created: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    // إضافة ملف SQL
    archive.file(dbFilePath, { name: path.basename(dbFilePath) });

    // إضافة مجلد المرفقات بشكل صحيح
    if (fs.existsSync(this.uploadsDir)) {
      archive.directory(this.uploadsDir, 'uploads');
      this.logger.log('📁 Adding uploads folder to backup');
    }

    archive.finalize();
  });
}

  /**
   * حذف النسخ الاحتياطية القديمة
   */
  private cleanupOldBackups(): void {
    const files = fs
      .readdirSync(this.backupDir)
      .filter((f) => f.endsWith('.zip'))
      .map((f) => ({
        name: f,
        time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > this.maxBackups) {
      const filesToDelete = files.slice(this.maxBackups);

      for (const file of filesToDelete) {
        const filePath = path.join(this.backupDir, file.name);
        fs.unlinkSync(filePath);
        this.logger.warn(`🗑️ Deleted old backup: ${file.name}`);
      }
    }
  }

  /**
   * قراءة ملف النسخة الاحتياطية
   */
  getBackupFile(filePath: string): Buffer {
    if (!fs.existsSync(filePath)) {
      throw new Error('Backup file not found');
    }
    return fs.readFileSync(filePath);
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  listBackups(): Array<{ filename: string; size: string; date: Date }> {
    const files = fs
      .readdirSync(this.backupDir)
      .filter((f) => f.endsWith('.zip'))
      .map((f) => {
        const stats = fs.statSync(path.join(this.backupDir, f));
        return {
          filename: f,
          size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          date: stats.mtime,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return files;
  }

  /**
   * التحقق من صحة اسم الملف (منع Path Traversal)
   */
  validateFilename(filename: string): void {
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new Error('Invalid filename');
    }

    if (!filename.endsWith('.zip')) {
      throw new Error('Only .zip files are allowed');
    }
  }
}