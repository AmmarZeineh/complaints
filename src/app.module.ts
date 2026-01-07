import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { EmailVerificationModule } from './modules/emailVerfication/EmailVerficationModule';
import { NotificationModule } from './modules/notification/notificationModule';
import { ScheduleModule } from '@nestjs/schedule';
import { GivernmentModule } from './modules/government/government.module';
import { ComplaintModule } from './modules/complaint/complaint.module';
import { ComplaintNoteModule } from './modules/complaintNote/complaintNote.module';
import { PermissionModule } from './modules/permission/permission.module';
import { UserRolePermissionModule } from './modules/userRolePermission/userRolePermission.module';
import { ComplaintHistoryModule } from './modules/complaintHistory/complaintHistory.module';
import { BackupModule } from './modules/backup/backup.module';
import { RoleModule } from './modules/role/role.module';
import { LoadBalancerModule } from './modules/load-balancer/load-balancer.module';
import { HealthController } from './modules/load-balancer/health.controller';
import { AopModule } from './common/aop/aop.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath:join(process.cwd(),'uploads'),
      serveRoot:'/uploads', 
    }),
    PrismaModule,
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    EmailVerificationModule,
    NotificationModule,
    GivernmentModule,
    ComplaintModule,
    ComplaintNoteModule,
    PermissionModule,
    UserRolePermissionModule,
    ComplaintHistoryModule,
    BackupModule,
    RoleModule,
    LoadBalancerModule,
    AopModule,
  ],
  controllers: [AppController,HealthController],
  providers: [AppService],
})
export class AppModule { }
