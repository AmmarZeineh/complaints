import {
  Controller,
  Get,
  Post,
  Put,
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
import { RoleApiService } from './role-api.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { RoleDto } from '../dtos/role.dto';
import { FindAllRoleDto } from '../dtos/find-all-role.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';

@ApiTags('Roles')
@Controller('role')
export class RoleController {
  constructor(private readonly _roleApi: RoleApiService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new role',
    description: 'إنشاء دور جديد',
  })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, type: RoleDto })
  async create(@Body() dto: CreateRoleDto): Promise<RoleDto> {
    return this._roleApi.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
    description: 'جلب جميع الأدوار',
  })
  @ApiResponse({ status: 200, type: FindAllRoleDto })
  async findAll(@Query() pagination: PaginationDto): Promise<FindAllRoleDto> {
    return this._roleApi.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get role by ID',
    description: 'جلب دور معين بواسطة المعرف',
  })
  @ApiParam({ name: 'id', description: 'معرف الدور' })
  @ApiResponse({ status: 200, type: RoleDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleDto> {
    return this._roleApi.findOne(id);
  }

  @Get(':id/permissions')
  @ApiOperation({
    summary: 'Get role with its permissions',
    description: 'جلب الدور مع صلاحياته',
  })
  @ApiParam({ name: 'id', description: 'معرف الدور' })
  @ApiResponse({ status: 200, type: RoleDto })
  async findOneWithPermissions(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RoleDto> {
    return this._roleApi.findOneWithPermissions(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update role',
    description: 'تحديث دور موجود',
  })
  @ApiParam({ name: 'id', description: 'معرف الدور' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, type: RoleDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    return this._roleApi.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete role',
    description: 'حذف دور (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'معرف الدور' })
  @ApiResponse({ status: 200, description: 'تم حذف الدور بنجاح' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this._roleApi.delete(id);
  }
}