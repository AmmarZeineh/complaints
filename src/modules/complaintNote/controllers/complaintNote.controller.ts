import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComplaintNoteApiService } from './complaintNote-api.service';
import { CreateComplaintNoteDto } from '../dtos/create-complaintNote.dto';
import { UpdateComplaintNoteDto } from '../dtos/update-complaintNote.dto';
import { ComplaintNoteDto } from '../dtos/complaintNote.dto';
import { FindAllComplaintNoteDto } from '../dtos/find-all-complaintNote.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintNoteFilterDto } from '../dtos/complaintNote-filter.dto';
import { UserApiService } from 'src/modules/users/controllers/user-api.service';

@ApiTags('Complaint Notes')
@Controller('complaint-note')
export class ComplaintNoteController {
  constructor(
    private readonly _complaintNoteApi: ComplaintNoteApiService,
    private readonly _userApiService: UserApiService,
  ) {}


 @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ 
    summary: 'Create a new complaint note (Government employees only)'
  })
  @ApiBody({ type: CreateComplaintNoteDto })
  @ApiResponse({ status: 201, type: ComplaintNoteDto })
  async create(
    @Body() dto: CreateComplaintNoteDto,
    @Req() req: any,
  ): Promise<ComplaintNoteDto> {
    const userId = Number(req.user.id);
    const user = await this._userApiService.findOne(userId);
    
    return this._complaintNoteApi.create(dto, userId, user.governmentId);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all complaint notes with filters'
  })
  @ApiResponse({ status: 200, type: FindAllComplaintNoteDto })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter?: ComplaintNoteFilterDto,
  ): Promise<FindAllComplaintNoteDto> {
    return this._complaintNoteApi.findAll(pagination, filter);
  }

//   @Get('by-complaint/:complaintId')
//   @ApiOperation({ 
//     summary: 'Get all notes for a specific complaint',
//     description: 'جلب جميع الملاحظات الخاصة بشكوى معينة'
//   })
//   @ApiParam({ name: 'complaintId', description: 'معرف الشكوى' })
//   @ApiResponse({ status: 200, type: FindAllComplaintNoteDto })
//   async findByComplaint(
//     @Param('complaintId', ParseIntPipe) complaintId: number,
//     @Query() pagination: PaginationDto,
//   ): Promise<FindAllComplaintNoteDto> {
//     return this._complaintNoteApi.findByComplaintId(complaintId, pagination);
//   }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get complaint note by ID'
  })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, type: ComplaintNoteDto })
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ComplaintNoteDto> {
    return this._complaintNoteApi.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update complaint note'
  })
  @ApiParam({ name: 'id', description: 'معرف الملاحظة' })
  @ApiBody({ type: UpdateComplaintNoteDto })
  @ApiResponse({ status: 200, type: ComplaintNoteDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComplaintNoteDto,
    @Req() req: any,
  ): Promise<ComplaintNoteDto> {
    const userId = Number(req.user.id);
    return this._complaintNoteApi.update(id, dto, userId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete complaint note'
  })
  @ApiParam({ name: 'id', description: 'معرف الملاحظة' })
  @ApiResponse({ status: 200, description: 'تم حذف الملاحظة بنجاح' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const userId = Number(req.user.id);
    return this._complaintNoteApi.delete(id, userId);
  }
}