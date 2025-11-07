import { NextRequest, NextResponse } from 'next/server';
import { memberService } from '@/services/memberService';
import { memberSchema } from '@/lib/validations';
import type { ApiResponse } from '@/types/api';
import type { Member } from '@prisma/client';

// POST /api/members - Cadastro completo com token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados
    const validatedData = memberSchema.parse(body);
    
    // Criar membro
    const member = await memberService.createFromInvite(validatedData);
    
    const response: ApiResponse<Member> = {
      success: true,
      data: member,
      message: 'Cadastro completo! Bem-vindo à plataforma.',
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
        message: 'Erro ao completar cadastro',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// GET /api/members - Listar membros
export async function GET() {
  try {
    const members = await memberService.list();
    
    const response: ApiResponse<Member[]> = {
      success: true,
      data: members,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro ao listar membros',
      },
    };
    return NextResponse.json(response, { status: 500 });
  }
}