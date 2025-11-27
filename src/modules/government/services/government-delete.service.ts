import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class GovernmentDeleteService {
  constructor(private readonly _prisma: PrismaService) {}

  async delete(id: number) {
    return this._prisma.government.delete({
      where: { id },
    });
  }
}
