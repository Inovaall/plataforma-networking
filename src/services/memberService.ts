// src/services/memberService.ts
import { prisma } from '@/lib/prisma';
import { verifyInviteToken } from '@/lib/auth';
import type { MemberInput } from '@/lib/validations';
import type { Member } from '@prisma/client';

class MemberService {
  /**
   * Criar membro a partir de candidatura aprovada
   */
  async create(data: MemberInput): Promise<Member> {
    const { inviteToken, phone, position, bio, expertise } = data;

    // Validar token
    const decoded = verifyInviteToken(inviteToken);
    if (!decoded) {
      throw new Error('Token de convite inválido ou expirado');
    }

    // Buscar candidatura
    const application = await prisma.application.findUnique({
      where: { inviteToken },
    });

    if (!application) {
      throw new Error('Candidatura não encontrada');
    }

    if (application.status !== 'APPROVED') {
      throw new Error('Candidatura não está aprovada');
    }

    // Verificar se token expirou
    if (application.inviteTokenExpiry && application.inviteTokenExpiry < new Date()) {
      throw new Error('Token de convite expirado');
    }

    // Verificar se membro já existe
    const existingMember = await prisma.member.findUnique({
      where: { email: application.email },
    });

    if (existingMember) {
      throw new Error('Membro já cadastrado');
    }

    // Criar membro
    return prisma.member.create({
      data: {
        applicationId: application.id,
        name: application.name,
        email: application.email,
        company: application.company,
        phone: phone || null,
        position: position || null,
        bio: bio || null,
        expertise,
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Listar membros ativos
   */
  async list(): Promise<Member[]> {
    return prisma.member.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { joinedAt: 'desc' },
    });
  }

  /**
   * Buscar membro por ID
   */
  async findById(id: string): Promise<Member | null> {
    return prisma.member.findUnique({
      where: { id },
    });
  }

  /**
   * Buscar membro por email
   */
  async findByEmail(email: string): Promise<Member | null> {
    return prisma.member.findUnique({
      where: { email },
    });
  }

  /**
   * Contar total de membros ativos
   */
  async countActive(): Promise<number> {
    return prisma.member.count({
      where: { status: 'ACTIVE' },
    });
  }
}

export const memberService = new MemberService();