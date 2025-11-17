import { PaginationListDto } from 'src/common/response/pagination-list.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ComplaintDto, RawComplaint } from './complaint.dto';

export class FindAllComplaintDto extends PaginationListDto<ComplaintDto> {
  @ApiProperty({ type: [ComplaintDto] })
  data: ComplaintDto[];

  constructor(count: number, raws: RawComplaint[]) {
    const complaint = raws.map((raw) => new ComplaintDto(raw));
    super(count, complaint);
    this.data = complaint;
  }
}
