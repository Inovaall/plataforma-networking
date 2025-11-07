import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@/services/applicationService';
import { approveApplicationSchema } from '@/lib/validations';
import { isAdmin } from '@/lib/auth';
import type { ApiResponse } from '@/types/api';
import type { Application } from '@prisma/client';

// POST /api/applications/:id/approve - Aprovar candidatura (admin)
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
    const validatedData = approveApplicationSchema.parse(body);
    
    const application = await applicationService.approve(
      params.id,
      validatedData.reviewedBy
    );
    
    // Gerar link de convite
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/cadastro/${application.inviteToken}`;
    
    // Simular envio de email (log)
    console.log('📧 Email de aprovação:');
    console.log(`   Para: ${application.email}`);
    console.log(`   Link: ${inviteLink}`);
    console.log(`   Expira em: ${application.inviteTokenExpiry}`);
    
    const response: ApiResponse<Application & { inviteLink: string }> = {
      success: true,
      data: {
        ...application,
        inviteLink,
      },
      message: 'Candidatura aprovada! Link de convite gerado.',
    };
    
    return NextResponse.json(response);
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