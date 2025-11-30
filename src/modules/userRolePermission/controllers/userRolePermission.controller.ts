import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UserRolePermissionApiService } from './userRolePermission-api.service';
import { AssignPermissionsDto } from '../dtos/assign-permission.dto';
import { UserRolePermissionDto } from '../dtos/userRolePermission.dto';
import { FindAllUserRolePermissionDto } from '../dtos/find-all-userRolePermission.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';

@ApiTags('User Role Permissions')
@Controller('user-role-permission')
export class UserRolePermissionController {
  constructor(
    private readonly _userRolePermissionApi: UserRolePermissionApiService,
  ) {}

   @Post('multiple')
  @ApiOperation({ 
    summary: 'Assign multiple permissions to role',
    description: 'ربط عدة صلاحيات بدور معين دفعة واحدة'
  })
  @ApiBody({ type: AssignPermissionsDto })
  @ApiResponse({ status: 201, type: UserRolePermissionDto  })
 async assignMultiple(
  @Body() dto: AssignPermissionsDto
): Promise<UserRolePermissionDto> {
  return this._userRolePermissionApi.assignMultiple(dto);
}

  
  @Get()
  @ApiOperation({ 
    summary: 'Get all role-permission mappings',
    description: 'جلب جميع الروابط بين الأدوار والصلاحيات'
  })
  @ApiResponse({ status: 200, type: FindAllUserRolePermissionDto })
  async findAll(
    @Query() pagination: PaginationDto,
  ): Promise<FindAllUserRolePermissionDto> {
    return this._userRolePermissionApi.findAll(pagination);
  }

  @Get('by-role/:userRoleId')
  @ApiOperation({ 
    summary: 'Get all permissions for a specific role',
    description: 'جلب جميع الصلاحيات لدور معين'
  })
  @ApiParam({ name: 'userRoleId', description: 'معرف الدور' })
  @ApiResponse({ status: 200, type: FindAllUserRolePermissionDto })
  async findByUserRoleId(
    @Param('userRoleId', ParseIntPipe) userRoleId: number,
    @Query() pagination: PaginationDto,
  ): Promise<FindAllUserRolePermissionDto> {
    return this._userRolePermissionApi.findByUserRoleId(userRoleId, pagination);
  }

  @Get('by-permission/:permissionId')
  @ApiOperation({ 
    summary: 'Get all roles that have a specific permission',
    description: 'جلب جميع الأدوار التي تملك صلاحية معينة'
  })
  @ApiParam({ name: 'permissionId', description: 'معرف الصلاحية' })
  @ApiResponse({ status: 200, type: FindAllUserRolePermissionDto })
  async findByPermissionId(
    @Param('permissionId', ParseIntPipe) permissionId: number,
    @Query() pagination: PaginationDto,
  ): Promise<FindAllUserRolePermissionDto> {
    return this._userRolePermissionApi.findByPermissionId(permissionId, pagination);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get role-permission mapping by ID',
    description: 'جلب ربط معين بين دور وصلاحية'
  })
  @ApiParam({ name: 'id', description: 'معرف الربط' })
  @ApiResponse({ status: 200, type: UserRolePermissionDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<UserRolePermissionDto> {
    return this._userRolePermissionApi.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete role-permission mapping by ID',
    description: 'حذف ربط بين دور وصلاحية'
  })
  @ApiParam({ name: 'id', description: 'معرف الربط' })
  @ApiResponse({ status: 200, description: 'تم حذف الربط بنجاح' })
  async delete(
    @Param('id', ParseIntPipe) id: number
  ): Promise<{ message: string }> {
    return this._userRolePermissionApi.delete(id);
  }

  @Delete('role/:userRoleId/permission/:permissionId')
  @ApiOperation({ 
    summary: 'Remove specific permission from role',
    description: 'إلغاء صلاحية معينة من دور معين'
  })
  @ApiParam({ name: 'userRoleId', description: 'معرف الدور' })
  @ApiParam({ name: 'permissionId', description: 'معرف الصلاحية' })
  @ApiResponse({ status: 200, description: 'تم إلغاء الصلاحية من الدور بنجاح' })
  async removePermissionFromRole(
    @Param('userRoleId', ParseIntPipe) userRoleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<{ message: string }> {
    return this._userRolePermissionApi.removePermissionFromRole(
      userRoleId,
      permissionId,
    );
  }
}