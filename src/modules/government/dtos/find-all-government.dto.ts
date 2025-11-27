import { PaginationListDto } from 'src/common/response/pagination-list.dto';
import { ApiProperty } from '@nestjs/swagger';
import { GovernmentDto, RawGovernment } from './government.dto';

export class FindAllGovernmentDto extends PaginationListDto<GovernmentDto> {
  @ApiProperty({ type: [GovernmentDto] })
  data: GovernmentDto[];

  constructor(count: number, raws: RawGovernment[]) {
    const government = raws.map((raw) => new GovernmentDto(raw));
    super(count, government);
    this.data = government;
  }
}
