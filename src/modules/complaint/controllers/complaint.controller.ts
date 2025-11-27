import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ComplaintApiService } from './complaint-api.service';
import { CreateComplaintDto } from '../dtos/create-complaint.dto';
import { UpdateComplaintDto } from '../dtos/update-complaint.dto';
import { ComplaintFilterDto } from '../dtos/complaint-filter.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintDto } from '../dtos/complaint.dto';
import { FindAllComplaintDto } from '../dtos/find-all-complaint.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Complaint')
@Controller('complaint')
export class ComplaintController {
  constructor(private readonly _complaintApi: ComplaintApiService) {}


    @ApiBearerAuth('access-token')
    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
  FileFieldsInterceptor([
    { name: 'images', maxCount: 10 },
    { name: 'documents', maxCount: 5 },
  ])
    )
    @ApiOperation({ summary: 'Create a new complaint with multiple files' })
    @ApiResponse({ type: ComplaintDto })
    async create(
      @Body() dto: CreateComplaintDto,
      @Req() req,
  @UploadedFiles() files: {
    images?: Express.Multer.File[],
    documents?: Express.Multer.File[]
  },    ) {
      const userId = Number(req.user.id);
      return this._complaintApi.create(dto, userId, files);
    }

  @Get()
  @ApiOperation({ summary: 'Get all complaints' })
  @ApiResponse({ type: FindAllComplaintDto })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter?: ComplaintFilterDto,
  ) {
    return this._complaintApi.findAll(pagination, filter);
  }


   @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('my-complaints')
  @ApiOperation({ summary: 'Get my complaints' })
  @ApiResponse({ type: FindAllComplaintDto })
  async getMyComplaints(
    @Query() pagination: PaginationDto,
    @Query() filter: ComplaintFilterDto,
    @Req() req: any,
  ) {
    const userId = Number(req.user.id);
    return this._complaintApi.findMyComplaints(userId, pagination, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  @ApiResponse({ type: ComplaintDto })
  async findOne(@Param('id') id: number) {
    return this._complaintApi.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 15))
  @ApiOperation({ summary: 'Update complaint with multiple files' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateComplaintDto,
    @Req() req: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const userId = Number(req.user.id);
    return this._complaintApi.update(id, dto, userId, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete complaint' })
  async delete(@Param('id') id: number) {
    return this._complaintApi.delete(id);
  }
}
