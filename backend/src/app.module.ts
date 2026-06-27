import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { ClientsModule } from './clients/clients.module';
import { SessionsModule } from './sessions/sessions.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SalonsModule } from './salons/salons.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PrismaModule } from './prisma/prisma.module';
import { AiEngineModule } from './admin/ai-engine/ai-engine.module';
import { ReportsModule } from './reports/reports.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    SupabaseModule,
    AuthModule,
    ServicesModule,
    ClientsModule,
    SessionsModule,
    AiModule,
    AnalyticsModule,
    AdminModule,
    SalonsModule,
    SubscriptionsModule,
    PrismaModule,
    AiEngineModule,
    ReportsModule,
    PlatformSettingsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
