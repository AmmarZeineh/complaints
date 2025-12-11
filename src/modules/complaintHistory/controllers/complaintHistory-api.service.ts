import { Injectable } from '@nestjs/common';
import { ComplaintHistoryGetterService } from '../services/complaintHistory-getter.service';
import { ComplaintHistoryExportService } from '../services/complaintHistory-export.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ComplaintHistoryPdfService } from '../services/complaintHistory-pdf.service';

@Injectable()
export class ComplaintHistoryApiService {
  constructor(
    private readonly _historyGetter: ComplaintHistoryGetterService,
    private readonly _exportService: ComplaintHistoryExportService,
    private readonly _pdfService: ComplaintHistoryPdfService,

  ) {}

  async getComplaintHistory(
    complaintId: number,
    pagination: PaginationDto,
  ) {
    return this._historyGetter.getComplaintHistory(complaintId, pagination);
  }

 
  async getHistoryStats(complaintId: number) {
    return this._historyGetter.getHistoryStats(complaintId);
  }

   
   // تصدير السجل الزمني كـ PDF
   
  async exportComplaintHistoryPDF(complaintId: number) {
    return this._exportService.exportComplaintHistoryPDF(complaintId);
  }
    
}