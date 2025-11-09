// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types/api';

export async function GET() {
  try {
    // Tentar conectar ao banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: '1.0.0',
      },
      message: 'API está funcionando corretamente',
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Erro ao verificar status da API',
      },
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      },
    };
    
    return NextResponse.json(response, { status: 503 });
  }
}