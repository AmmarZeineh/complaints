import { FindAllComplaintHistoryDto } from '../dtos/find-all-history.dto';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags,
  ApiProduces,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { 
  Controller, 
  Get, 
  Param, 
  ParseIntPipe, 
  Query, 
  UseGuards,
  Res,
  Header,
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintHistoryApiService } from '../controllers/complaintHistory-api.service';
import { ExportResponseDto } from '../dtos/export-response.dto';
import { createReadStream } from 'fs';
import path, { join } from 'path';
import { PermissionsGuard, RequirePermissions } from 'src/modules/auth/guards/permissions.guard';

@ApiTags('Complaint History')
@Controller('complaint-history')
export class ComplaintHistoryController {
  constructor(
    private readonly _complaintHistoryApi: ComplaintHistoryApiService,
  ) {}
  
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get complaint history timeline with files' })
  @ApiResponse({ type: FindAllComplaintHistoryDto })
  async getComplaintHistory(
    @Param('id', ParseIntPipe) complaintId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this._complaintHistoryApi.getComplaintHistory(complaintId, pagination);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get history statistics for complaint' })
  async getHistoryStats(@Param('id', ParseIntPipe) complaintId: number) {
    return this._complaintHistoryApi.getHistoryStats(complaintId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermissions('export_complaint_history')
  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Generate PDF and get download info' })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF generated successfully',
    type: ExportResponseDto,
  })
  async exportPDF(
    @Param('id', ParseIntPipe) complaintId: number,
  ) {
    const result = await this._complaintHistoryApi.exportComplaintHistoryPDF(complaintId);
    
    return {
      success: true,
      message: 'تم إنشاء التقرير بنجاح',
      data: {
        downloadUrl: result.downloadUrl,
        fileName: result.fileName,
        fileSize: result.fileSize,
        recordsCount: result.recordsCount,
        generatedAt: result.generatedAt,
      },
    };
  }
}

