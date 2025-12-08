import { PaginationListDto } from 'src/common/response/pagination-list.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ComplaintHistoryDto, RawComplaintHistory } from './complaintHistory.dto';

export class FindAllComplaintHistoryDto extends PaginationListDto<ComplaintHistoryDto> {
  @ApiProperty({ type: [ComplaintHistoryDto] })
  data: ComplaintHistoryDto[];

  constructor(count: number, raws: RawComplaintHistory[]) {
    const histories = raws.map((raw) => new ComplaintHistoryDto(raw));
    super(count, histories);
    this.data = histories;
  }
}