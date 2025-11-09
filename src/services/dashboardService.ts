// src/services/dashboardService.ts
import { prisma } from '@/lib/prisma';

interface DashboardStats {
  members: {
    total: number;
    active: number;
    inactive: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  referrals: {
    total: number;
    sent: number;
    inNegotiation: number;
    closed: number;
    declined: number;
  };
  thanks: {
    total: number;
  };
}

class DashboardService {
  /**
   * Obter estatísticas gerais do dashboard
   */
  async getStats(): Promise<DashboardStats> {
    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalReferrals,
      sentReferrals,
      inNegotiationReferrals,
      closedReferrals,
      declinedReferrals,
      totalThanks,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.member.count({ where: { status: 'INACTIVE' } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.referral.count(),
      prisma.referral.count({ where: { status: 'SENT' } }),
      prisma.referral.count({ where: { status: 'IN_NEGOTIATION' } }),
      prisma.referral.count({ where: { status: 'CLOSED' } }),
      prisma.referral.count({ where: { status: 'DECLINED' } }),
      prisma.thank.count(),
    ]);

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
        inactive: inactiveMembers,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
      },
      referrals: {
        total: totalReferrals,
        sent: sentReferrals,
        inNegotiation: inNegotiationReferrals,
        closed: closedReferrals,
        declined: declinedReferrals,
      },
      thanks: {
        total: totalThanks,
      },
    };
  }

  /**
   * Top membros com mais indicações
   */
  async getTopReferrers(limit: number = 5) {
    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: {
            referralsMade: true,
          },
        },
      },
      orderBy: {
        referralsMade: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return members.map(member => ({
      id: member.id,
      name: member.name,
      company: member.company,
      referralsCount: member._count.referralsMade,
    }));
  }
}

export const dashboardService = new DashboardService();