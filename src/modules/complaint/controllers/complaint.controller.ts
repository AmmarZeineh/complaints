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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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
@UseInterceptors(FileInterceptor('documents'))
@ApiOperation({ summary: 'Create a new complaint' })
@ApiResponse({ type: ComplaintDto })
async create(
  @Body() dto: CreateComplaintDto,
  @Req() req,
  @UploadedFile() file?: Express.Multer.File,
) {
  const userId = Number(req.user.id);
  return this._complaintApi.create(dto, userId, file);
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

@Get('by-government')
@ApiOperation({ summary: 'Get complaints by government name' })
@ApiResponse({ type: FindAllComplaintDto })
async findByGovernment(
  @Query('name') governmentName: string,
  @Query() pagination: PaginationDto,
) {
  return this._complaintApi.findByGovernmentName(governmentName, pagination);
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
  @UseInterceptors(FileInterceptor('documents'))
  @ApiOperation({ summary: 'Update complaint' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateComplaintDto,
     @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const userId = Number(req.user.id);
    return this._complaintApi.update(id, dto,userId, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete complaint' })
  async delete(@Param('id') id: number) {
    return this._complaintApi.delete(id);
  }


}
