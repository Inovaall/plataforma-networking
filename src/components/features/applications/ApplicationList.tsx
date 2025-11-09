// src/components/features/applications/ApplicationList.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Application } from '@prisma/client';
import { ApplicationCard } from './ApplicationCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = filter === 'ALL' 
        ? '/api/applications'
        : `/api/applications?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin_super_secret_token_change_me_in_production',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar candidaturas');
      }

      const result = await response.json();
      setApplications(result.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar candidaturas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const handleStatusChange = () => {
    fetchApplications();
  };

  const counts = {
    ALL: applications.length,
    PENDING: applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">{error}</p>
        <Button onClick={fetchApplications} variant="outline" className="mt-2">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
          size="sm"
        >
          Todas <Badge variant="secondary" className="ml-2">{counts.ALL}</Badge>
        </Button>
        <Button
          variant={filter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setFilter('PENDING')}
          size="sm"
        >
          Pendentes <Badge variant="warning" className="ml-2">{counts.PENDING}</Badge>
        </Button>
        <Button
          variant={filter === 'APPROVED' ? 'default' : 'outline'}
          onClick={() => setFilter('APPROVED')}
          size="sm"
        >
          Aprovadas <Badge variant="success" className="ml-2">{counts.APPROVED}</Badge>
        </Button>
        <Button
          variant={filter === 'REJECTED' ? 'default' : 'outline'}
          onClick={() => setFilter('REJECTED')}
          size="sm"
        >
          Rejeitadas <Badge variant="destructive" className="ml-2">{counts.REJECTED}</Badge>
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Carregando candidaturas...</p>
        </div>
      )}

      {/* Lista */}
      {!isLoading && applications.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          Nenhuma candidatura encontrada.
        </div>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="grid gap-4">
          {applications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}