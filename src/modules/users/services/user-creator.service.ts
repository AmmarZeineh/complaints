import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/services/prisma.service';
import { UserDto } from '../dtos/user.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { selectUserValidator } from '../validators/select-user-validator';
import { CreateEmployeeDto } from '../dtos/create-employee .dto';

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

  async createEmployee(data: CreateEmployeeDto): Promise<UserDto> {

    const government = await this._prisma.government.findUnique({
  where: { id: data.governmentId },
});

if (!government) {
  throw new NotFoundException(`Government with ID ${data.governmentId} not found`);
}

  const raw = await this._prisma.user.create({
    data: {
    name: data.name,
    email: data.email,
    password: data.password,
    roleId: 2, 
    governmentId: data.governmentId,
    nationalID: null,
    isEmailVerified: true,
     },
    select: selectUserValidator(),
  });

  return new UserDto(raw);
}

}
