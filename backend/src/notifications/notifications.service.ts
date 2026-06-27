import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  salonId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(salonId: string) {
    return this.prisma.notification.findMany({
      where: { salonId },
      orderBy: { createdAt: 'desc' },
      take: 50, // limit to 50 most recent
    });
  }

  async create(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        salonId: data.salonId,
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, salonId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, salonId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(salonId: string) {
    return this.prisma.notification.updateMany({
      where: { salonId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, salonId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, salonId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
