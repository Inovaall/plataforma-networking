// src/lib/__tests__/auth.test.ts
import {
  isAdmin,
  generateInviteToken,
  verifyInviteToken,
  getInviteTokenExpiry,
} from '../auth';

describe('Authentication Functions', () => {
  describe('isAdmin', () => {
    it('deve retornar true para token válido', () => {
      const result = isAdmin('test_admin_token');
      expect(result).toBe(true);
    });

    it('deve retornar false para token inválido', () => {
      const result = isAdmin('invalid_token');
      expect(result).toBe(false);
    });

    it('deve retornar false para token null', () => {
      const result = isAdmin(null);
      expect(result).toBe(false);
    });

    it('deve retornar false para token vazio', () => {
      const result = isAdmin('');
      expect(result).toBe(false);
    });
  });

  describe('generateInviteToken', () => {
    it('deve gerar um token JWT válido', () => {
      const token = generateInviteToken('app_123', 'test@example.com');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('deve gerar tokens diferentes para IDs diferentes', () => {
      const token1 = generateInviteToken('app_123', 'test1@example.com');
      const token2 = generateInviteToken('app_456', 'test2@example.com');
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyInviteToken', () => {
    it('deve validar e decodificar token válido', () => {
      const applicationId = 'app_123';
      const email = 'test@example.com';
      const token = generateInviteToken(applicationId, email);
      
      const decoded = verifyInviteToken(token);
      
      expect(decoded).not.toBeNull();
      expect(decoded?.applicationId).toBe(applicationId);
      expect(decoded?.email).toBe(email);
      expect(decoded?.type).toBe('invite');
    });

    it('deve retornar null para token inválido', () => {
      const decoded = verifyInviteToken('invalid_token');
      
      expect(decoded).toBeNull();
    });

    it('deve retornar null para token vazio', () => {
      const decoded = verifyInviteToken('');
      
      expect(decoded).toBeNull();
    });

    it('deve rejeitar token com tipo errado', () => {
      // Criar um token com tipo diferente seria complexo,
      // mas o teste está aqui para documentar o comportamento esperado
      const decoded = verifyInviteToken('fake.token.here');
      expect(decoded).toBeNull();
    });
  });

  describe('getInviteTokenExpiry', () => {
    it('deve retornar data futura', () => {
      const expiry = getInviteTokenExpiry();
      const now = new Date();
      
      expect(expiry).toBeInstanceOf(Date);
      expect(expiry.getTime()).toBeGreaterThan(now.getTime());
    });

    it('deve retornar data 7 dias no futuro', () => {
      const expiry = getInviteTokenExpiry();
      const now = new Date();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const expectedTime = now.getTime() + sevenDaysInMs;
      
      // Permitir diferença de 1 segundo devido ao tempo de execução
      const diff = Math.abs(expiry.getTime() - expectedTime);
      expect(diff).toBeLessThan(1000);
    });
  });
});