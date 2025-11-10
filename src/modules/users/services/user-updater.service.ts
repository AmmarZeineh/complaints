import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UserDto } from '../dtos/user.dto';
import { selectUserValidator } from '../validators/select-user-validator';
  import * as bcrypt from 'bcrypt';

@Injectable()
export class UserUpdaterService {
  constructor(private readonly _prisma: PrismaService) { }
  async update(id: number, data: IUpdateUser): Promise<UserDto> {


    return await this._prisma.user.update({
      where: { id },
      data,      
      select: selectUserValidator(), 
    });
    };

  async forgetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await this._prisma.user.findUnique({ where: { email } });
    if (!user) return false;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this._prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return true;
  }
}
export type IUpdateUser = Partial<UserDto>;


