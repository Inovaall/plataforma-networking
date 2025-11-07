import { NextRequest, NextResponse } from 'next/server';
import { applicationService } from '@/services/applicationService';
import { applicationSchema, applicationQuerySchema } from '@/lib/validations';
import { isAdmin } from '@/lib/auth';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Application } from '@prisma/client';

// POST /api/applications - Criar candidatura (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = applicationSchema.parse(body);
    
    // Criar candidatura
    const application = await applicationService.create(validatedData);
    
    const response: ApiResponse<Application> = {
      success: true,
      data: application,
      message: 'Candidatura enviada com sucesso! Você receberá um email quando for aprovada.',
    };
    
    return NextResponse.json(response, { status: 201 });
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
        message: 'Erro ao processar candidatura',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// GET /api/applications - Listar candidaturas (admin)
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
    
    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };
    
    const validatedQuery = applicationQuerySchema.parse(queryParams);
    
    // Buscar candidaturas
    const result = await applicationService.list(validatedQuery);
    
    const response: ApiResponse<PaginatedResponse<Application>> = {
      success: true,
      data: result,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao listar candidaturas',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}