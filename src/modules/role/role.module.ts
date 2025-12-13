import { Module } from '@nestjs/common';
import { RoleController } from './controllers/role.controller';
import { RoleApiService } from './controllers/role-api.service';
import { RoleCreatorService } from './services/role-creator.service';
import { RoleGetterService } from './services/role-getter.service';
import { RoleUpdaterService } from './services/role-updater.service';
import { RoleDeleterService } from './services/role-deleter.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoleController],
  providers: [
    RoleApiService,
    RoleCreatorService,
    RoleGetterService,
    RoleUpdaterService,
    RoleDeleterService,
  ],
  exports: [RoleApiService, RoleGetterService],
})
export class RoleModule {}