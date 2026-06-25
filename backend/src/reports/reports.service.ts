import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  async getRevenueReport() {
    // Empty for now as requested
    return {
      columns: ["Date", "Transaction ID", "Salon Name", "Amount", "Method", "Status"],
      rows: []
    };
  }

  async getSalonReport() {
    const salons = await this.prisma.salon.findMany({
      include: {
        subscription: true,
        aiLogs: true,
      }
    });

    return {
      columns: ["Salon Name", "Owner Name", "Total Staff", "Total Appointments", "Status", "Actions"],
      rows: salons.map(s => ({
        id: s.id,
        col1: s.name,
        col2: s.ownerName || s.ownerId,
        col3: "0", // Need staff count
        col4: "0", // Need appts count
        col5: s.status,
        col6: "Actions"
      }))
    };
  }

  async getStaffReport() {
    const { data } = await this.supabase.db
      .from('profiles')
      .select('*')
      .eq('role', 'barber');

    const profiles = data || [];

    return {
      columns: ["Staff Name", "Role", "Phone", "Created At"],
      rows: profiles.map(p => ({
        id: p.id,
        col1: p.full_name || 'Unknown',
        col2: p.role,
        col3: p.phone || 'N/A',
        col4: new Date(p.created_at).toLocaleDateString(),
      }))
    };
  }

  async getCustomerReport() {
    // Skipped for now
    return {
      columns: ["Customer Name", "Phone", "Total Visits", "Total Spend", "Last Visit"],
      rows: []
    };
  }

  async getAiReport() {
    const aiUsage = await this.prisma.aPIUsage.findMany({
      include: { salon: true }
    });

    return {
      columns: ["Salon Name", "API Calls", "Tokens Used", "Daily Limit", "Status"],
      rows: aiUsage.map(usage => ({
        id: usage.id,
        col1: usage.salon?.name || 'Unknown',
        col2: usage.apiCalls.toString(),
        col3: usage.tokensUsed.toString(),
        col4: usage.dailyLimit.toString(),
        col5: usage.isBlocked ? 'Blocked' : 'Active'
      }))
    };
  }

  async getSubscriptionReport() {
    const salons = await this.prisma.salon.findMany({
      include: { subscription: true },
      where: { subscriptionId: { not: null } }
    });

    return {
      columns: ["Salon Name", "Plan", "Status", "Monthly Price", "Barber Limit"],
      rows: salons.map(s => ({
        id: s.id,
        col1: s.name,
        col2: s.subscription?.name || 'N/A',
        col3: s.status,
        col4: s.subscription?.monthlyPrice ? `₹${s.subscription.monthlyPrice}` : 'Free',
        col5: s.subscription?.barberLimit?.toString() || '0'
      }))
    };
  }

  async getReport(type: string) {
    switch (type.toLowerCase()) {
      case 'revenue': return this.getRevenueReport();
      case 'salon': return this.getSalonReport();
      case 'staff': return this.getStaffReport();
      case 'customer': return this.getCustomerReport();
      case 'ai': return this.getAiReport();
      case 'subscription': return this.getSubscriptionReport();
      default: return { columns: [], rows: [] };
    }
  }
}
