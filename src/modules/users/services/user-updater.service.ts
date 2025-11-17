import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UserDto } from '../dtos/user.dto';
import { selectUserValidator } from '../validators/select-user-validator';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserUpdaterService {
  constructor(private readonly _prisma: PrismaService) {}

  async update(id: number, data: IUpdateUser): Promise<UserDto> {
    const existingUser = await this._prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (data.nationalID && data.nationalID !== existingUser.nationalID) {
      const duplicateNationalID = await this._prisma.user.findUnique({
        where: { nationalID: data.nationalID },
      });

      if (duplicateNationalID) {
        throw new BadRequestException('الرقم الوطني مستخدم من قبل مستخدم آخر');
      }
    }

    // if (data.email && data.email !== existingUser.email) {
    //   const duplicateEmail = await this._prisma.user.findUnique({
    //     where: { email: data.email },
    //   });

    //   if (duplicateEmail) {
    //     throw new BadRequestException('البريد الإلكتروني مستخدم من قبل مستخدم آخر');
    //   }
    // }

    const updateData: Prisma.UserUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.nationalID !== undefined && { nationalID: data.nationalID }),
      // ...(data.email !== undefined && { email: data.email }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('لم يتم إرسال أي بيانات للتحديث');
    }

    return await this._prisma.user.update({
      where: { id },
      data: updateData,
      select: selectUserValidator(),
    });
  }

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