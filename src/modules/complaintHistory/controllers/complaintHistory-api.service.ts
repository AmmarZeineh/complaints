// src/modules/complaintHistory/services/complaintHistory-api.service.ts
import { Injectable } from '@nestjs/common';
import { ComplaintHistoryGetterService } from '../services/complaintHistory-getter.service';
import { ComplaintHistoryExportService } from '../services/complaintHistory-export.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';

@Injectable()
export class ComplaintHistoryApiService {
  constructor(
    private readonly _historyGetter: ComplaintHistoryGetterService,
    private readonly _pdfExport: ComplaintHistoryExportService,
  ) {}

  /**
   * جلب السجل الزمني الكامل لشكوى
   */
  async getComplaintHistory(
    complaintId: number,
    pagination: PaginationDto,
  ) {
    return this._historyGetter.getComplaintHistory(complaintId, pagination);
  }

  /**
   * جلب إحصائيات السجل الزمني لشكوى
   */
  async getHistoryStats(complaintId: number) {
    return this._historyGetter.getHistoryStats(complaintId);
  }

  /**
   * تصدير تقرير PDF
   */
  async exportComplaintReportPDF(complaintId: number): Promise<Buffer> {
    return this._pdfExport.exportComplaintReport(complaintId);
  }
}