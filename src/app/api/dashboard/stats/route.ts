import { NextRequest, NextResponse } from 'next/server';
import { dashboardService } from '@/services/dashboardService';
import { isAdmin } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

// GET /api/dashboard/stats
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

    // Buscar estatísticas
    const stats = await dashboardService.getStats();

    const response: ApiResponse<typeof stats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar estatísticas',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}