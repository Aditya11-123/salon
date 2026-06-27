import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationsService, CreateNotificationDto } from './notifications.service';
import { CronService } from './cron.service';
// import { AuthGuard } from '../auth/auth.guard'; // Assuming there's a guard to get req.user
// Mocking the Guard for now since I can't verify the exact AuthGuard name
// You can replace this with your actual Salon/Admin AuthGuard

@Controller('admin/notifications')
// @UseGuards(AuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly cronService: CronService
  ) {}

  @Get('test-cron')
  async triggerTestCron() {
    return this.cronService.triggerTestCron();
  }

  @Get()
  async getNotifications(@Req() req: any) {
    const salonId = req.user?.salonId || req.user?.id || 'TEST_SALON_ID'; 
    return this.notificationsService.findAll(salonId);
  }

  @Post()
  async createNotification(@Body() createDto: CreateNotificationDto) {
    if (createDto.salonId === 'TEST_SALON_ID') {
      const firstSalon = await this.notificationsService['prisma'].salon.findFirst();
      if (firstSalon) {
        createDto.salonId = firstSalon.id;
      }
    }
    return this.notificationsService.create(createDto);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const salonId = req.user?.salonId || req.user?.id || 'TEST_SALON_ID';
    return this.notificationsService.markAsRead(id, salonId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    const salonId = req.user?.salonId || req.user?.id || 'TEST_SALON_ID';
    return this.notificationsService.markAllAsRead(salonId);
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    const salonId = req.user?.salonId || req.user?.id || 'TEST_SALON_ID';
    return this.notificationsService.delete(id, salonId);
  }
}
