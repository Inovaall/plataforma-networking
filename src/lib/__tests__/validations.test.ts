// src/lib/__tests__/validations.test.ts
import {
  applicationSchema,
  memberSchema,
  approveApplicationSchema,
  rejectApplicationSchema,
  applicationQuerySchema,
} from '../validations';

describe('Validation Schemas', () => {
  describe('applicationSchema', () => {
    it('deve aceitar dados válidos', () => {
      const validData = {
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Tech Solutions',
        motivation: 'A'.repeat(50), // 50 caracteres
      };

      const result = applicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'email-invalido',
        company: 'Tech Solutions',
        motivation: 'A'.repeat(50),
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidData = {
        name: 'J',
        email: 'joao@empresa.com',
        company: 'Tech Solutions',
        motivation: 'A'.repeat(50),
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar motivação muito curta', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Tech Solutions',
        motivation: 'Curta', // menos de 50 caracteres
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar motivação muito longa', () => {
      const invalidData = {
        name: 'João Silva',
        email: 'joao@empresa.com',
        company: 'Tech Solutions',
        motivation: 'A'.repeat(1001), // mais de 1000 caracteres
      };

      const result = applicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('memberSchema', () => {
    it('deve aceitar dados válidos', () => {
      const validData = {
        inviteToken: 'valid_token_123',
        phone: '11987654321',
        position: 'CEO',
        bio: 'Profissional com experiência',
        expertise: ['Tecnologia', 'Vendas'],
      };

      const result = memberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve aceitar dados opcionais vazios', () => {
      const validData = {
        inviteToken: 'valid_token_123',
        expertise: ['Tecnologia'],
      };

      const result = memberSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar sem token', () => {
      const invalidData = {
        expertise: ['Tecnologia'],
      };

      const result = memberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar sem expertise', () => {
      const invalidData = {
        inviteToken: 'valid_token_123',
        expertise: [],
      };

      const result = memberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve rejeitar bio muito longa', () => {
      const invalidData = {
        inviteToken: 'valid_token_123',
        bio: 'A'.repeat(501), // mais de 500 caracteres
        expertise: ['Tecnologia'],
      };

      const result = memberSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('approveApplicationSchema', () => {
    it('deve aceitar reviewedBy válido', () => {
      const validData = {
        reviewedBy: 'Admin Maria',
      };

      const result = approveApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar reviewedBy vazio', () => {
      const invalidData = {
        reviewedBy: '',
      };

      const result = approveApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('rejectApplicationSchema', () => {
    it('deve aceitar reviewedBy válido', () => {
      const validData = {
        reviewedBy: 'Admin João',
      };

      const result = rejectApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('applicationQuerySchema', () => {
    it('deve aceitar query params válidos', () => {
      const validData = {
        status: 'PENDING',
        page: '1',
        limit: '20',
      };

      const result = applicationQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('deve usar valores padrão', () => {
      const validData = {};

      const result = applicationQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('deve rejeitar status inválido', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      const result = applicationQuerySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('deve coercer strings para números', () => {
      const validData = {
        page: '5',
        limit: '50',
      };

      const result = applicationQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(5);
        expect(result.data.limit).toBe(50);
      }
    });
  });
});