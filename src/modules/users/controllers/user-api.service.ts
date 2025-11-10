import { UserCreatorService } from '../services/user-creator.service';
import { UserGetterService } from '../services/user-getter.service';
import { UserUpdaterService } from '../services/user-updater.service';
import { UserDeleteService } from '../services/user-delete.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { UserFilterDto } from '../dtos/user-filter.dto';
import { UserDto } from '../dtos/user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { FindAllUserDto } from '../dtos/find-all-user.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ForgetPasswordDto } from '../dtos/forgetPassword.dto';
import { EmailVerification } from '@prisma/client';
import { EmailVerificationService } from 'src/modules/emailVerfication/EmailVerificationService';

@Injectable()
export class UserApiService {
  constructor(
    private readonly _userCreator: UserCreatorService,
    private readonly _userGetter: UserGetterService,
    private readonly _userUpdater: UserUpdaterService,
    private readonly _userDelete: UserDeleteService,
    private readonly emailVerificationService: EmailVerificationService,

  ) {}


async forgetPassword(dto: ForgetPasswordDto): Promise<{ message: string }> {
  await this._userUpdater.forgetPassword(dto.email, dto.newPassword);
  return { message: 'Password updated successfully' };
}

  async create(data: CreateUserDto): Promise<UserDto> {
    const hashedPassword = await bcrypt.hash(data.password,10);

  
    const raw = await this._userCreator.create({
      ...data,
      password: hashedPassword,
    });

     if(Number(data.roleId)==3){
      await this.emailVerificationService.sendVerificationCode(data.email);  
      } 
    return new UserDto(raw);
  }

  async findOne(id: number): Promise<UserDto> {
    const raw = await this._userGetter.findById(id);
    return new UserDto(raw);
  }

  async findAll(
    pagination: PaginationDto,
    filter: UserFilterDto,
  ): Promise<FindAllUserDto> {
    return await this._userGetter.findAll(pagination, filter);
  }

  async update(id: number, data: UpdateUserDto): Promise<UserDto> {
     console.log(id)
    const raw = await this._userUpdater.update(id, data);
   
    return new UserDto(raw);
  }

  async delete(id: number): Promise<{ message: string }> {
    await this._userDelete.delete(id);
    return { message: 'Successfully deleted' };
  }

}
