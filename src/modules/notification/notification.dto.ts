import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    description: 'Firebase device token يلي رح يوصل عليه الإشعار',
    example: 'dPfQ4lDkR9e1...xyz', // هون حط أي token تجريبي حقيقي من Firebase
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'عنوان الإشعار',
    example: 'تجربة إشعار',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'محتوى الإشعار',
    example: 'هذا إشعار تجريبي من الباك',
  })
  @IsString()
  body: string;
}
