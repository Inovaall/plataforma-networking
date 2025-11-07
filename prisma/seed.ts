import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpar dados existentes
  await prisma.thank.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.member.deleteMany();
  await prisma.application.deleteMany();

  // Criar candidaturas de exemplo
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        name: 'João Silva',
        email: 'joao@techsolutions.com',
        company: 'Tech Solutions Ltda',
        motivation:
          'Busco expandir minha rede de contatos no setor de tecnologia e gerar novos negócios através de indicações qualificadas.',
        status: 'PENDING',
      },
    }),
    prisma.application.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@consulting.com',
        company: 'Consulting Pro',
        motivation:
          'Quero fazer parte de um grupo profissional que valoriza networking e colaboração para crescimento mútuo.',
        status: 'APPROVED',
        inviteToken: 'invite_approved_member',
        inviteTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reviewedBy: 'Admin',
        reviewedAt: new Date(),
      },
    }),
  ]);

  console.log(`✅ ${applications.length} candidaturas criadas`);

  // Criar membros de exemplo
  const members = await Promise.all([
    prisma.member.create({
      data: {
        applicationId: applications[1].id,
        name: 'Maria Santos',
        email: 'maria@consulting.com',
        phone: '+55 11 98765-4321',
        company: 'Consulting Pro',
        position: 'CEO',
        bio: 'Consultora de negócios com 15 anos de experiência em transformação digital.',
        expertise: ['Consultoria', 'Transformação Digital', 'Estratégia'],
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`✅ ${members.length} membros criados`);

  console.log('✨ Seed concluído com sucesso!');
}

main()
  .catch(e => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });