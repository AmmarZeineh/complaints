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

//  // ✅ تصدير تقرير PDF
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
  //   // ✅ تصدير تقرير PDF - تنزيل مباشر
  // @Get(':id/export/pdf')
  // @ApiOperation({ summary: 'Export and download complaint history as PDF' })
  // @ApiProduces('application/pdf')
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'PDF file download',
  //   schema: {
  //     type: 'string',
  //     format: 'binary',
  //   },
  // })
  // async exportPDF(
  //   @Param('id', ParseIntPipe) complaintId: number,
  //   @Res({ passthrough: true }) res: Response,
  // ): Promise<StreamableFile> {
  //   // توليد الملف
  //   const result = await this._complaintHistoryApi.exportComplaintHistoryPDF(complaintId);
    
  //   const filePath = path.join(process.cwd(), 'uploads', 'exports', result.fileName);
    
  //   // إعداد Headers للتنزيل
  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': `attachment; filename="${encodeURIComponent(`complaint-${complaintId}-history.pdf`)}"`,
  //     'Content-Length': result.fileSizeBytes,
  //     'Cache-Control': 'no-cache, no-store, must-revalidate',
  //     'Pragma': 'no-cache',
  //     'Expires': '0',
  //   });

  //   // إنشاء stream وإرجاع الملف
  //   const file = createReadStream(filePath);
    
  //   // // حذف الملف بعد الإرسال (بعد 5 ثواني)
  //   // setTimeout(() => {
  //   //   this._complaintHistoryApi.cleanupFile(filePath);
  //   // }, 5000);

  //   return new StreamableFile(file);
  // }
  
}

