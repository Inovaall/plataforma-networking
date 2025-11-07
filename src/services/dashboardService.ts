import { prisma } from '@/lib/prisma';

export const dashboardService = {
  // Buscar estatísticas gerais
  async getStats(startDate?: Date, endDate?: Date) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const start = startDate || firstDayOfMonth;
    const end = endDate || lastDayOfMonth;

    // Membros ativos
    const totalMembers = await prisma.member.count({
      where: { status: 'ACTIVE' },
    });

    // Indicações no período
    const referralsInPeriod = await prisma.referral.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Indicações por status
    const referralsByStatus = await prisma.referral.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: true,
    });

    // Obrigados no período
    const thanksInPeriod = await prisma.thank.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Candidaturas pendentes
    const pendingApplications = await prisma.application.count({
      where: { status: 'PENDING' },
    });

    // Top membros por indicações feitas
    const topReferralGivers = await prisma.referral.groupBy({
      by: ['giverId'],
      _count: true,
      orderBy: {
        _count: {
          giverId: 'desc',
        },
      },
      take: 5,
    });

    const topGiversWithDetails = await Promise.all(
      topReferralGivers.map(async (item) => {
        const member = await prisma.member.findUnique({
          where: { id: item.giverId },
          select: { name: true, company: true },
        });
        return {
          ...member,
          totalReferrals: item._count,
        };
      })
    );

    return {
      period: {
        startDate: start,
        endDate: end,
        label: `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`,
      },
      members: {
        total: totalMembers,
      },
      referrals: {
        total: referralsInPeriod,
        byStatus: referralsByStatus.reduce(
          (acc, item) => {
            acc[item.status] = item._count;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      thanks: {
        total: thanksInPeriod,
      },
      applications: {
        pending: pendingApplications,
      },
      topPerformers: topGiversWithDetails,
    };
  },
};