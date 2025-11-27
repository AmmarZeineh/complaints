import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { GovernmentApiService } from './government-api.service';
import { CreateGovernmentDto } from '../dtos/create-government.dto';
import { UpdateGovernmentDto } from '../dtos/update-government.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { GovernmentFilterDto } from '../dtos/government-filter.dto';
import { GovernmentDto } from '../dtos/government.dto';
import { FindAllGovernmentDto } from '../dtos/find-all-government.dto';

@ApiTags('Government')
@Controller('government')
export class GovernmentController {
  constructor(private readonly _governmentApi: GovernmentApiService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new government entity' })
  @ApiBody({ type: CreateGovernmentDto })
  @ApiResponse({ type: GovernmentDto })
  async create(@Body() dto: CreateGovernmentDto) {
    return this._governmentApi.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all government entities' })
  @ApiResponse({ type: FindAllGovernmentDto })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter?: GovernmentFilterDto,
  ) {
    return this._governmentApi.findAll(pagination, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get government by ID' })
  @ApiResponse({ type: GovernmentDto })
  async findOne(@Param('id') id: number) {
    return this._governmentApi.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update government by ID' })
  @ApiResponse({ type: GovernmentDto })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateGovernmentDto,
  ) {
    return this._governmentApi.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete government by ID' })
  async delete(@Param('id') id: number) {
    return this._governmentApi.delete(id);
  }
}
