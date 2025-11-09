// src/components/features/dashboard/DashboardStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardData {
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
  topPerformers?: Array<{
    id: string;
    name: string;
    company: string;
    referralsCount: number;
  }>;
}

export function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin_super_secret_token_change_me_in_production',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  const conversionRate = data.referrals.total > 0
    ? ((data.referrals.closed / data.referrals.total) * 100).toFixed(1)
    : '0.0';

  const approvalRate = data.applications.total > 0
    ? ((data.applications.approved / data.applications.total) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Membros Ativos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Ativos</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.members.active}</div>
            <p className="text-xs text-muted-foreground">
              {data.members.total} total ({data.members.inactive} inativos)
            </p>
          </CardContent>
        </Card>

        {/* Candidaturas Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Revisão</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.applications.pending}</div>
            <p className="text-xs text-muted-foreground">
              {approvalRate}% aprovadas historicamente
            </p>
          </CardContent>
        </Card>

        {/* Indicações Totais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações Totais</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.referrals.total}</div>
            <p className="text-xs text-muted-foreground">
              {data.referrals.closed} fechadas ({conversionRate}%)
            </p>
          </CardContent>
        </Card>

        {/* Obrigados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agradecimentos</CardTitle>
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.thanks.total}</div>
            <p className="text-xs text-muted-foreground">
              Negócios concluídos e agradecidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Indicações por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Indicações por Status</CardTitle>
            <CardDescription>Distribuição atual das indicações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Enviadas</span>
                </div>
                <span className="text-sm font-medium">{data.referrals.sent}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Em Negociação</span>
                </div>
                <span className="text-sm font-medium">{data.referrals.inNegotiation}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm">Fechadas</span>
                </div>
                <span className="text-sm font-medium">{data.referrals.closed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm">Recusadas</span>
                </div>
                <span className="text-sm font-medium">{data.referrals.declined}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Membros</CardTitle>
            <CardDescription>Membros com mais indicações</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topPerformers && data.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {data.topPerformers.map((member, index) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.company}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">
                      {member.referralsCount} indicações
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma indicação registrada ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Candidaturas</CardTitle>
          <CardDescription>Status de todas as candidaturas recebidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{data.applications.total}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{data.applications.pending}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Aprovadas</p>
              <p className="text-2xl font-bold text-green-600">{data.applications.approved}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rejeitadas</p>
              <p className="text-2xl font-bold text-red-600">{data.applications.rejected}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}