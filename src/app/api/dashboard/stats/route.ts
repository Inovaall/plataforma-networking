// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/services/dashboardService';
import { isAdmin } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const adminToken = request.headers.get('x-admin-token');
    if (!isAdmin(adminToken)) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token de administrador inválido',
        },
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Obter estatísticas
    const stats = await dashboardService.getStats();
    
    // Obter top performers
    const topPerformers = await dashboardService.getTopReferrers(5);
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...stats,
        topPerformers,
      },
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao obter estatísticas',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}