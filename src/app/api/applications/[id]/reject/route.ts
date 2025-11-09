// src/app/api/applications/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@/services/applicationService';
import { rejectApplicationSchema } from '@/lib/validations';
import { isAdmin } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';

export async function POST(
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

    const body = await request.json();
    
    // Validar dados
    const validatedData = rejectApplicationSchema.parse(body);
    
    // Rejeitar candidatura
    const application = await applicationService.reject(
      params.id,
      validatedData.reviewedBy
    );
    
    const response: ApiResponse = {
      success: true,
      data: {
        id: application.id,
        status: application.status,
        reviewedAt: application.reviewedAt,
      },
      message: 'Candidatura rejeitada.',
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao rejeitar candidatura',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}