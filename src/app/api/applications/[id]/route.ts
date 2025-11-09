// src/app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@/services/applicationService';
import { isAdmin } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Buscar candidatura
    const application = await applicationService.findById(params.id);
    
    if (!application) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Candidatura não encontrada',
        },
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse = {
      success: true,
      data: application,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao buscar candidatura',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}