import { prisma } from '@/lib/prisma';
import { verifyInviteToken } from '@/lib/auth';
import type { MemberInput } from '@/lib/validations';

export const memberService = {
  // Criar membro a partir de token de convite
  async createFromInvite(data: MemberInput) {
    // Verificar token
    const decoded = verifyInviteToken(data.inviteToken);
    if (!decoded) {
      throw new Error('Token inválido ou expirado');
    }

    // Buscar application
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
    });

    if (!application) {
      throw new Error('Candidatura não encontrada');
    }

    if (application.status !== 'APPROVED') {
      throw new Error('Candidatura não foi aprovada');
    }

    if (application.inviteToken !== data.inviteToken) {
      throw new Error('Token inválido');
    }

    if (application.inviteTokenExpiry && application.inviteTokenExpiry < new Date()) {
      throw new Error('Token expirado');
    }

    // Verificar se já existe membro
    const existingMember = await prisma.member.findUnique({
      where: { applicationId: application.id },
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
        phone: data.phone,
        position: data.position,
        bio: data.bio,
        expertise: data.expertise,
        status: 'ACTIVE',
      },
    });
  },

  // Listar membros ativos
  async list() {
    return prisma.member.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { joinedAt: 'desc' },
    });
  },

  // Buscar por ID
  async findById(id: string) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });
  },
};