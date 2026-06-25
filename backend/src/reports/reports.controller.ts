import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'super_admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':type')
  async getReport(@Param('type') type: string) {
    return this.reportsService.getReport(type);
  }
}
