import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UpdateGovernmentDto } from '../dtos/update-government.dto';
import { selectGovernmentValidator } from '../validators/select-government-validator';

@Injectable()
export class GovernmentUpdaterService {
  constructor(private readonly _prisma: PrismaService) {}

  async update(id: number, dto: UpdateGovernmentDto) {
    return await this._prisma.government.update({
      where: { id },
      data: dto,
      select: selectGovernmentValidator(),
    });
  }
}
