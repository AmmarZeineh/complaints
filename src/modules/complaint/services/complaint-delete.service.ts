import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';

@Injectable()
export class ComplaintDeleteService {
  constructor(private readonly _prisma: PrismaService) {}

  async delete(id: number) {
    return this._prisma.complaint.delete({
      where: { id },
    });
  }
}
