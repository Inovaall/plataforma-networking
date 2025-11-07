import { z } from 'zod';

// ========================================
// APPLICATION SCHEMAS
// ========================================

export const applicationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  company: z.string().min(2, 'Empresa deve ter no mínimo 2 caracteres').max(150),
  motivation: z
    .string()
    .min(50, 'Motivação deve ter no mínimo 50 caracteres')
    .max(1000, 'Motivação deve ter no máximo 1000 caracteres'),
});

export const approveApplicationSchema = z.object({
  reviewedBy: z.string().min(1, 'Nome do revisor é obrigatório'),
});

export const rejectApplicationSchema = z.object({
  reviewedBy: z.string().min(1, 'Nome do revisor é obrigatório'),
});

// ========================================
// MEMBER SCHEMAS
// ========================================

export const memberSchema = z.object({
  inviteToken: z.string().min(1, 'Token de convite é obrigatório'),
  phone: z.string().optional(),
  position: z.string().optional(),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  expertise: z.array(z.string()).min(1, 'Selecione ao menos uma área de expertise'),
});

// ========================================
// QUERY SCHEMAS
// ========================================

export const applicationQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ========================================
// TYPE EXPORTS
// ========================================

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
export type ApplicationQuery = z.infer<typeof applicationQuerySchema>;