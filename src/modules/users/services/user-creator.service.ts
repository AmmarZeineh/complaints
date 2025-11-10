import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UserDto } from '../dtos/user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { selectUserValidator } from '../validators/select-user-validator';

@Injectable()
export class UserCreatorService {
  constructor(private readonly _prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<UserDto> {
    const existingUser = await this._prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const created = await this._prisma.user.create({
      data,
      select: selectUserValidator(),
    });

    return created as UserDto;
  }
}
