import {
  Controller,
  Get,
  Post,
  Patch,
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
import { PermissionApiService } from './permission-api.service';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { UpdatePermissionDto } from '../dtos/update-permission.dto';
import { PermissionDto } from '../dtos/permission.dto';
import { FindAllPermissionDto } from '../dtos/find-all-permission.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { PermissionFilterDto } from '../dtos/permission-filter.dto';

@ApiTags('Permissions')
@Controller('permission')
export class PermissionController {
  constructor(private readonly _permissionApi: PermissionApiService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({ status: 201, type: PermissionDto })
  async create(@Body() dto: CreatePermissionDto): Promise<PermissionDto> {
    return this._permissionApi.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponse({ status: 200, type: FindAllPermissionDto })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter?: PermissionFilterDto,
  ): Promise<FindAllPermissionDto> {
    return this._permissionApi.findAll(pagination, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'معرف الصلاحية' })
  @ApiResponse({ status: 200, type: PermissionDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PermissionDto> {
    return this._permissionApi.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission by ID' })
  @ApiParam({ name: 'id', description: 'معرف الصلاحية' })
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 200, type: PermissionDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
  ): Promise<PermissionDto> {
    return this._permissionApi.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission by ID' })
  @ApiParam({ name: 'id', description: 'معرف الصلاحية' })
  @ApiResponse({ status: 200, description: 'تم حذف الصلاحية بنجاح' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    return this._permissionApi.delete(id);
  }
}