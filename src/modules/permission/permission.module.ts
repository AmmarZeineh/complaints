import { Module } from '@nestjs/common';
import { PermissionController } from './controllers/permission.controller';
import { PermissionApiService } from './controllers/permission-api.service';
import { PermissionCreatorService } from './services/permission-creator.service';
import { PermissionGetterService } from './services/permission-getter.service';
import { PermissionUpdaterService } from './services/permission-updater.service';
import { PermissionDeleterService } from './services/permission-deleter.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionController],
  providers: [
    PermissionApiService,
    PermissionCreatorService,
    PermissionGetterService,
    PermissionUpdaterService,
    PermissionDeleterService,
  ],
  exports: [PermissionApiService],
})
export class PermissionModule {}