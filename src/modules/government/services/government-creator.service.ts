import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { CreateGovernmentDto } from '../dtos/create-government.dto';
import { selectGovernmentValidator } from '../validators/select-government-validator';

@Injectable()
export class GovernmentCreatorService {
  constructor(private readonly _prisma: PrismaService) {}

  async create(dto: CreateGovernmentDto) {
    const exists = await this._prisma.government.findUnique({
      where: { name: dto.name },
    });

    if (exists) throw new ConflictException('Government name already exists');

    return await this._prisma.government.create({
      data: dto,
      select: selectGovernmentValidator(),
    });
  }
}
