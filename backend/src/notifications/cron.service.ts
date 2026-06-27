import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {
    // Configure Nodemailer for Free Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'test@gmail.com',
        pass: process.env.GMAIL_PASS || 'dummy-password',
      },
    });
  }

  // 1. Birthdays (Runs everyday at 8 AM)
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleBirthdays() {
    this.logger.log('Running Birthday Cron Job...');
    
    // Simulate finding a client with a birthday today
    const today = new Date();
    // In a real query: where: { dateOfBirth: { equals: today } }
    
    // As per user request, we just print this to terminal logs for testing today
    this.logger.log('🎂 [SIMULATED EMAIL] Sending Happy Birthday to client@example.com! "Happy Birthday from AI Salon!"');
  }

  // 2. Appointments (Runs every hour)
  @Cron(CronExpression.EVERY_HOUR)
  async handleAppointments() {
    this.logger.log('Running Appointment Reminder Cron Job...');
    
    // Simulate finding an appointment
    this.logger.log('📅 [SIMULATED EMAIL] Sending Reminder to client@example.com! "Your appointment is tomorrow at 2 PM."');
  }

  // 3. Subscription Expire (Runs everyday at 9 AM)
  @Cron('0 9 * * *')
  async handleSubscriptions() {
    this.logger.log('Running Subscription Renewal Cron Job...');
    
    const salons = await this.prisma.salon.findMany({
      take: 1, // just picking one for testing
    });

    if (salons.length > 0) {
      const targetSalon = salons[0];
      this.logger.log(`⚠️ [INTERNAL NOTIFICATION] Pushing renewal reminder to Salon ID: ${targetSalon.id}`);
      
      await this.notificationsService.create({
        salonId: targetSalon.id,
        type: 'RENEWAL',
        title: 'Subscription Expiring Soon',
        message: 'Your AI Salon subscription will expire in 3 days. Please renew to avoid service interruption.',
      });
    }
  }

  // Manual Trigger Endpoint Helper
  async triggerTestCron() {
    this.logger.log('--- MANUAL CRON TRIGGER INITIATED ---');
    await this.handleBirthdays();
    await this.handleAppointments();
    await this.handleSubscriptions();
    return { success: true, message: 'All cron jobs manually triggered. Check backend terminal logs.' };
  }
}
