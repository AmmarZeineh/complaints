import { ApiProperty } from '@nestjs/swagger';

export class ExportResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'تم إنشاء التقرير بنجاح' })
  message: string;

  @ApiProperty({
    example: {
      downloadUrl: 'http://localhost:3000/uploads/exports/complaint-history-123-1733850000.pdf',
      fileName: 'complaint-history-123-1733850000.pdf',
      fileSize: '1.2 MB',
      recordsCount: 45,
      generatedAt: '2024-12-10T10:30:00Z',
    },
  })
  data: {
    downloadUrl: string;
    fileName: string;
    fileSize: string;
    recordsCount: number;
    generatedAt: string;
  };
}