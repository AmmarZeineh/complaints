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
  ParseIntPipe,
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
import { UpdateComplaintStatusDto } from '../dtos/udpate-status.dto';
import { InteractionDto } from '../dtos/interaction.dto';
import { CreateInteractionDto } from '../dtos/create-interaction.dto';


@ApiTags('Complaint')
@Controller('complaint')
export class ComplaintController {
  constructor(private readonly _complaintApi: ComplaintApiService) {}

    // 🔥 جديد: جلب الشكاوى الغير محجوزة (للموظفين)
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('available')
  @ApiOperation({ summary: 'Get available (unassigned) complaints for employee' })
  @ApiResponse({ type: FindAllComplaintDto })
  async getAvailableComplaints(
    @Query() pagination: PaginationDto,
    @Query() filter: ComplaintFilterDto,
    @Req() req: any,
  ) {
    const employeeId = Number(req.user.id);
    return this._complaintApi.findAvailableComplaints(employeeId, pagination, filter);
  }

  // 🔥 جديد: جلب الشكاوى المحجوزة للموظف
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get('my-assigned')
  @ApiOperation({ summary: 'Get complaints assigned to current employee' })
  @ApiResponse({ type: FindAllComplaintDto })
  async getMyAssignedComplaints(
    @Query() pagination: PaginationDto,
    @Query() filter: ComplaintFilterDto,
    @Req() req: any,
  ) {
    const employeeId = Number(req.user.id);
    return this._complaintApi.findMyAssignedComplaints(employeeId, pagination, filter);
  }

   @ApiBearerAuth('access-token')
   @UseGuards(AuthGuard('jwt'))
   @Post(':id/assign')
   async assignComplaint(
    @Param('id') id: number,
    @Req() req: any
  ) {
    const employeeId = req.user.id; 
    return this._complaintApi.assignComplaint(id, employeeId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  async updateStatus(
  @Param('id') id: number,
  @Body() dto: UpdateComplaintStatusDto,
  @Req() req:any
  ) {
    const employeeId = req.user.id;
  return this._complaintApi.updateStatus(id, dto.status,employeeId);
  }


  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Post('interaction')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'documents', maxCount: 5 },
    ]),
  )
  @ApiOperation({ summary: 'Create interaction with optional files' })
  @ApiResponse({ type: InteractionDto })
  async createinteraction(
    @Body() dto: CreateInteractionDto,
    @Req() req,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    const userId = Number(req.user.id);
    return this._complaintApi.createinteraction(dto, userId, files);
  }



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

@Get('by-government/:id')
@ApiOperation({ summary: 'Get complaints by government id' })
@ApiResponse({ type: FindAllComplaintDto })
async findByGovernment(
  @Param('id', ParseIntPipe) governmentId: number,
  @Query() pagination: PaginationDto,
) {
  return this._complaintApi.findByGovernmentId(governmentId, pagination);
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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'documents', maxCount: 5 },
    ])
  )
  @ApiOperation({ summary: 'Update complaint with images and documents' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateComplaintDto,
    @Req() req: any,
    @UploadedFiles() files?: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
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
