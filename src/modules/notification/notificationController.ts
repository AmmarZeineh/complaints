import { Controller, Post, Body, Get, UseGuards, Req, Patch, Param, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './notification.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('test-notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async test(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendNotification(dto.token, dto.title, dto.body);
  }


  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'get all notification for a user' })
  @ApiResponse({ status: 200})
  @Get()
  getAll(@Req() req) {
    return this.notificationService.findAllForUser(req.user.id);
  }

  
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'mark Read' })
  @ApiResponse({ status: 200})
  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req) {
    return this.notificationService.markAsRead(Number(id), req.user.id);
  }

    @ApiOperation({ summary: 'delete a notification' })
  @ApiResponse({ status: 200})
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.notificationService.remove(Number(id), req.user.id);
  }
}

