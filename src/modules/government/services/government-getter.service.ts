import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { GovernmentFilterDto } from '../dtos/government-filter.dto';
import { FindAllGovernmentDto } from '../dtos/find-all-government.dto';
import { selectGovernmentValidator } from '../validators/select-government-validator';

@Injectable()
export class GovernmentGetterService {
  constructor(private readonly _prisma: PrismaService) {}

  async findAll(
    pagination: PaginationDto,
    filter?: GovernmentFilterDto,
  ): Promise<FindAllGovernmentDto> {
    const skip = Math.max(pagination.skip ?? 0, 0);
    const take = pagination.limit ?? 10;

    const where = filter?.search
      ? { name: { contains: filter.search } }
      : {};

    const [data, count] = await Promise.all([
      this._prisma.government.findMany({
        where,
        skip,
        take,
        select: selectGovernmentValidator(),
      }),
      this._prisma.government.count({ where }),
    ]);

    return new FindAllGovernmentDto(count, data);
  }

  async findById(id: number) {
    return await this._prisma.government.findUniqueOrThrow({
      where: { id },
      select: selectGovernmentValidator(),
    });
  }
}
