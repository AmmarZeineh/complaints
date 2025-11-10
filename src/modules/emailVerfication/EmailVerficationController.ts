import {
  Body,
  Controller,
  Post,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmailVerificationService } from './EmailVerificationService';
import { EmailVerificationDto } from './EmailVerfication.dto';

@ApiTags('Email Verification')
@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with code sent to inbox' })
  @ApiBody({ type: EmailVerificationDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
  async verify(@Body() dto: EmailVerificationDto) {
    const result = await this.emailVerificationService.verifyCode(
      dto.email,
      dto.code,
    );
    if (!result) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    return { message: 'Email verified successfully' };
  }

  @Post('send-code')
  @ApiOperation({ summary: 'Send or resend email verification code' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({ status: 200, description: 'Verification code sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendCode(@Body() body: { email: string }) {
    const sent = await this.emailVerificationService.sendVerificationCode(body.email);
    if (!sent) throw new NotFoundException('User not found');
    return { message: 'Verification code sent successfully' };
  }
}
