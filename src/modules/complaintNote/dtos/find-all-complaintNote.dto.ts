import { PaginationListDto } from 'src/common/response/pagination-list.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ComplaintNoteDto, RawComplaintNote } from './complaintNote.dto';

export class FindAllComplaintNoteDto extends PaginationListDto<ComplaintNoteDto> {
  @ApiProperty({ type: [ComplaintNoteDto] })
  data: ComplaintNoteDto[];

  constructor(count: number, raws: RawComplaintNote[]) {
    const notes = raws.map((raw) => new ComplaintNoteDto(raw));
    super(count, notes);
    this.data = notes;
  }
}