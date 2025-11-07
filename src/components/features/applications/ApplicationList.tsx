'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import type { Application } from '@prisma/client';

const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin_token';

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/applications'
        : `/api/applications?status=${filter}`;
      
      const response = await fetch(url, {
        headers: {
          'X-Admin-Token': ADMIN_TOKEN,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setApplications(result.data.items || []);
      }
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/applications/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': ADMIN_TOKEN,
        },
        body: JSON.stringify({ reviewedBy: 'Admin' }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Candidatura aprovada!\n\nLink de convite:\n${result.data.inviteLink}`);
        fetchApplications();
      } else {
        alert(`❌ Erro: ${result.error?.message}`);
      }
    } catch (error) {
      alert('❌ Erro ao aprovar candidatura');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tem certeza que deseja rejeitar esta candidatura?')) {
      return;
    }

    setProcessingId(id);
    try {
      const response = await fetch(`/api/applications/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': ADMIN_TOKEN,
        },
        body: JSON.stringify({ reviewedBy: 'Admin' }),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Candidatura rejeitada');
        fetchApplications();
      } else {
        alert(`❌ Erro: ${result.error?.message}`);
      }
    } catch (error) {
      alert('❌ Erro ao rejeitar candidatura');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    const labels = {
      PENDING: 'Pendente',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button
          variant={filter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setFilter('PENDING')}
        >
          Pendentes
        </Button>
        <Button
          variant={filter === 'APPROVED' ? 'default' : 'outline'}
          onClick={() => setFilter('APPROVED')}
        >
          Aprovadas
        </Button>
        <Button
          variant={filter === 'REJECTED' ? 'default' : 'outline'}
          onClick={() => setFilter('REJECTED')}
        >
          Rejeitadas
        </Button>
      </div>

      {/* Lista */}
      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Nenhuma candidatura encontrada
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{app.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{app.email}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Empresa:</p>
                  <p className="text-sm text-gray-600">{app.company}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Motivação:</p>
                  <p className="text-sm text-gray-600">{app.motivation}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Enviado em {formatDateTime(app.submittedAt)}
                  </p>

                  {app.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(app.id)}
                        disabled={processingId === app.id}
                      >
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(app.id)}
                        disabled={processingId === app.id}
                      >
                        {processingId === app.id ? 'Processando...' : 'Aprovar'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}