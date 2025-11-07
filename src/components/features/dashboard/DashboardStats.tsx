'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, MessageCircle, FileText } from 'lucide-react';

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin_token';

interface Stats {
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  members: {
    total: number;
  };
  referrals: {
    total: number;
    byStatus: Record<string, number>;
  };
  thanks: {
    total: number;
  };
  applications: {
    pending: number;
  };
  topPerformers: Array<{
    name: string;
    company: string;
    totalReferrals: number;
  }>;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'X-Admin-Token': ADMIN_TOKEN,
        },
      });

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando estatísticas...</div>;
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Erro ao carregar estatísticas
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Período */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900">
          📅 Período: {stats.period.label}
        </p>
      </div>

      {/* Cards principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.members.total}</div>
            <p className="text-xs text-muted-foreground">Total de membros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.referrals.total}</div>
            <p className="text-xs text-muted-foreground">No mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obrigados</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thanks.total}</div>
            <p className="text-xs text-muted-foreground">No mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidaturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications.pending}</div>
            <p className="text-xs text-muted-foreground">Pendentes de análise</p>
          </CardContent>
        </Card>
      </div>

      {/* Indicações por status */}
      <Card>
        <CardHeader>
          <CardTitle>Indicações por Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.referrals.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {status === 'SENT' && '📤 Enviadas'}
                  {status === 'IN_NEGOTIATION' && '🤝 Em Negociação'}
                  {status === 'CLOSED' && '✅ Fechadas'}
                  {status === 'DECLINED' && '❌ Recusadas'}
                </span>
                <span className="text-sm font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(stats.referrals.byStatus).length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma indicação no período</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 - Membros com Mais Indicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topPerformers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{performer.name}</p>
                  <p className="text-sm text-gray-500">{performer.company}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {performer.totalReferrals}
                  </p>
                  <p className="text-xs text-gray-500">indicações</p>
                </div>
              </div>
            ))}
            {stats.topPerformers.length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma indicação registrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}