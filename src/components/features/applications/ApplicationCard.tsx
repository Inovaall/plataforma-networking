// src/components/features/applications/ApplicationCard.tsx
'use client';

import { useState } from 'react';
import type { Application } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

interface ApplicationCardProps {
  application: Application;
  onStatusChange?: () => void;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', variant: 'warning' as const },
  APPROVED: { label: 'Aprovado', variant: 'success' as const },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' as const },
};

export function ApplicationCard({ application, onStatusChange }: ApplicationCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    if (!confirm('Deseja aprovar esta candidatura?')) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${application.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin_super_secret_token_change_me_in_production',
        },
        body: JSON.stringify({ reviewedBy: 'Admin' }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Erro ao aprovar');
      }

      onStatusChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Deseja rejeitar esta candidatura?')) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/applications/${application.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'admin_super_secret_token_change_me_in_production',
        },
        body: JSON.stringify({ reviewedBy: 'Admin' }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error?.message || 'Erro ao rejeitar');
      }

      onStatusChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar');
    } finally {
      setIsProcessing(false);
    }
  };

  const statusConfig = STATUS_CONFIG[application.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{application.name}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{application.email}</p>
            <p className="text-sm text-gray-600">{application.company}</p>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Motivação:</p>
            <p className="text-sm text-gray-600 mt-1">{application.motivation}</p>
          </div>

          <div className="flex gap-4 text-xs text-gray-500 mt-4">
            <div>
              <span className="font-medium">Submetido em:</span>{' '}
              {formatDateTime(application.submittedAt)}
            </div>
            {application.reviewedAt && (
              <div>
                <span className="font-medium">Revisado em:</span>{' '}
                {formatDateTime(application.reviewedAt)}
              </div>
            )}
          </div>

          {application.inviteToken && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <p className="font-medium text-blue-900">Link de Convite:</p>
              <code className="text-blue-700 break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/cadastro/{application.inviteToken}
              </code>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 text-sm rounded">
            {error}
          </div>
        )}
      </CardContent>

      {application.status === 'PENDING' && (
        <CardFooter className="gap-2">
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex-1"
            variant="default"
          >
            {isProcessing ? 'Processando...' : 'Aprovar'}
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            className="flex-1"
            variant="destructive"
          >
            {isProcessing ? 'Processando...' : 'Rejeitar'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}