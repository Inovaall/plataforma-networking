// src/app/api/applications/[id]/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@/services/applicationService';
import { approveApplicationSchema } from '@/lib/validations';
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
    const validatedData = approveApplicationSchema.parse(body);
    
    // Aprovar candidatura
    const application = await applicationService.approve(
      params.id,
      validatedData.reviewedBy
    );
    
    const response: ApiResponse = {
      success: true,
      data: {
        id: application.id,
        status: application.status,
        inviteToken: application.inviteToken,
        inviteLink: `${request.nextUrl.origin}/cadastro/${application.inviteToken}`,
        inviteTokenExpiry: application.inviteTokenExpiry,
      },
      message: 'Candidatura aprovada! Link de convite gerado.',
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
        message: 'Erro ao aprovar candidatura',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}