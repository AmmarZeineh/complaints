import { Module } from '@nestjs/common';
import { UserRolePermissionController } from './controllers/userRolePermission.controller';
import { UserRolePermissionApiService } from './controllers/userRolePermission-api.service';
import { UserRolePermissionCreatorService } from './services/userRolePermission-creator.service';
import { UserRolePermissionGetterService } from './services/userRolePermission-getter.service';
import { UserRolePermissionDeleterService } from './services/userRolePermission-deleter.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserRolePermissionController],
  providers: [
    UserRolePermissionApiService,
    UserRolePermissionCreatorService,
    UserRolePermissionGetterService,
    UserRolePermissionDeleterService,
  ],
  exports: [UserRolePermissionApiService],
})
export class UserRolePermissionModule {}