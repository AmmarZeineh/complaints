// src/modules/complaintHistory/controllers/complaintHistory.controller.ts
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
} from '@nestjs/common';
import { Response } from 'express';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { ComplaintHistoryApiService } from '../controllers/complaintHistory-api.service';

@ApiTags('Complaint History')
@Controller('complaint-history')
export class ComplaintHistoryController {
  constructor(
    private readonly _complaintHistoryApi: ComplaintHistoryApiService,
  ) {}
  
  // ✅ جلب السجل الزمني الكامل لشكوى
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

  // ✅ جلب إحصائيات السجل الزمني
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get history statistics for complaint' })
  async getHistoryStats(@Param('id', ParseIntPipe) complaintId: number) {
    return this._complaintHistoryApi.getHistoryStats(complaintId);
  }

  // ✅ تصدير تقرير PDF
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/export/pdf')
  @ApiOperation({ summary: 'Export complaint report as PDF' })
  @ApiProduces('application/pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPDF(
    @Param('id', ParseIntPipe) complaintId: number,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this._complaintHistoryApi.exportComplaintReportPDF(complaintId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=complaint-${complaintId}-report.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  }

}