// src/services/applicationService.ts
import { prisma } from '@/lib/prisma';
import { generateInviteToken, getInviteTokenExpiry } from '@/lib/auth';
import type { ApplicationInput, ApplicationQuery } from '@/lib/validations';
import type { Application, ApplicationStatus } from '@prisma/client';
import type { PaginatedResponse } from '@/types/api';

class ApplicationService {
  /**
   * Criar nova candidatura
   */
  async create(data: ApplicationInput): Promise<Application> {
    // Verificar se email já existe
    const existing = await prisma.application.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Email já cadastrado');
    }

    return prisma.application.create({
      data: {
        name: data.name,
        email: data.email,
        company: data.company,
        motivation: data.motivation,
        status: 'PENDING',
      },
    });
  }

  /**
   * Listar candidaturas com filtros e paginação
   */
  async list(query: ApplicationQuery): Promise<PaginatedResponse<Application>> {
    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: { status?: ApplicationStatus } = {};
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Buscar candidatura por ID
   */
  async findById(id: string): Promise<Application | null> {
    return prisma.application.findUnique({
      where: { id },
    });
  }

  /**
   * Aprovar candidatura e gerar token de convite
   */
  async approve(id: string, reviewedBy: string): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Candidatura não encontrada');
    }

    if (application.status !== 'PENDING') {
      throw new Error('Candidatura já foi revisada');
    }

    // Gerar token único
    const inviteToken = generateInviteToken(application.id, application.email);
    const inviteTokenExpiry = getInviteTokenExpiry();

    return prisma.application.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy,
        reviewedAt: new Date(),
        inviteToken,
        inviteTokenExpiry,
      },
    });
  }

  /**
   * Rejeitar candidatura
   */
  async reject(id: string, reviewedBy: string): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Candidatura não encontrada');
    }

    if (application.status !== 'PENDING') {
      throw new Error('Candidatura já foi revisada');
    }

    return prisma.application.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  /**
   * Buscar candidatura por token de convite
   */
  async findByInviteToken(token: string): Promise<Application | null> {
    return prisma.application.findUnique({
      where: { inviteToken: token },
    });
  }
}

export const applicationService = new ApplicationService();