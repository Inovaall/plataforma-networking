import { prisma } from '@/lib/prisma';
import { generateInviteToken } from '@/lib/auth';
import type { ApplicationInput } from '@/lib/validations';
import type { ApplicationStatus } from '@prisma/client';

export const applicationService = {
  // Criar nova candidatura
  async create(data: ApplicationInput) {
    // Verificar se email já existe
    const existing = await prisma.application.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Email já cadastrado');
    }

    return prisma.application.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  },

  // Listar candidaturas com filtro e paginação
  async list(filters: {
    status?: ApplicationStatus;
    page: number;
    limit: number;
  }) {
    const { status, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
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
  },

  // Buscar por ID
  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
    });
  },

  // Aprovar candidatura
  async approve(id: string, reviewedBy: string) {
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Candidatura não encontrada');
    }

    if (application.status !== 'PENDING') {
      throw new Error('Candidatura já foi processada');
    }

    // Gerar token de convite
    const inviteToken = generateInviteToken(application.id, application.email);
    const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

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
  },

  // Rejeitar candidatura
  async reject(id: string, reviewedBy: string) {
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new Error('Candidatura não encontrada');
    }

    if (application.status !== 'PENDING') {
      throw new Error('Candidatura já foi processada');
    }

    return prisma.application.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  },
};