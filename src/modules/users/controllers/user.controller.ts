import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Patch,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserApiService } from './user-api.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PaginationDto } from 'src/common/filter/pagination/pagination-param.dto';
import { UserDto } from '../dtos/user.dto';
import { UserFilterDto } from '../dtos/user-filter.dto';
import { FindAllUserDto } from '../dtos/find-all-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { EmailVerificationService } from 'src/modules/emailVerfication/EmailVerificationService';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { ForgetPasswordDto } from '../dtos/forgetPassword.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly _userApiService: UserApiService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
  type: CreateUserDto,
  })
  @ApiResponse({ type: UserDto })
  async create(
   @Body() body: CreateUserDto): Promise<UserDto> {
  return this._userApiService.create(body);
  }

  @Get()
  @ApiResponse({ type: FindAllUserDto })
  @ApiOperation({ summary: 'Get all users' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter?: UserFilterDto,
  ) {
    return this._userApiService.findAll(pagination, filter);
  }

  @Get(':id')
  @ApiResponse({ type: UserDto })
  @ApiOperation({ summary: 'Get a user by ID' })
  async findOne(@Param('id') id: number) {
    return this._userApiService.findOne(id);
  }

  @Patch('forget-password') 
  @ApiOperation({ summary: 'forget  password' })
  async forgetPassword(
    @Body() forgetPassword: ForgetPasswordDto,
  ) {
    
    return this._userApiService.forgetPassword(forgetPassword);
  }

  @Patch(':id')
  @ApiResponse({ type: UserDto })
  @ApiOperation({ summary: 'Update a user by ID' })
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this._userApiService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  async remove(@Param('id') id: number) {
    return this._userApiService.delete(id);
  }

}
