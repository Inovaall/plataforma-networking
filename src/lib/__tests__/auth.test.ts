import { generateInviteToken, verifyInviteToken, isAdmin } from '../auth';

describe('auth utilities', () => {
  describe('generateInviteToken', () => {
    it('deve gerar um token válido', () => {
      const token = generateInviteToken('app_123', 'test@test.com');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyInviteToken', () => {
    it('deve verificar token válido', () => {
      const token = generateInviteToken('app_123', 'test@test.com');
      const decoded = verifyInviteToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.applicationId).toBe('app_123');
      expect(decoded?.email).toBe('test@test.com');
    });

    it('deve rejeitar token inválido', () => {
      const decoded = verifyInviteToken('token_invalido');
      expect(decoded).toBeNull();
    });

    it('deve rejeitar token vazio', () => {
      const decoded = verifyInviteToken('');
      expect(decoded).toBeNull();
    });
  });

  describe('isAdmin', () => {
    const originalEnv = process.env.ADMIN_SECRET_TOKEN;

    beforeAll(() => {
      process.env.ADMIN_SECRET_TOKEN = 'test-admin-token';
    });

    afterAll(() => {
      process.env.ADMIN_SECRET_TOKEN = originalEnv;
    });

    it('deve retornar true para token correto', () => {
      expect(isAdmin('test-admin-token')).toBe(true);
    });

    it('deve retornar false para token incorreto', () => {
      expect(isAdmin('token-errado')).toBe(false);
    });

    it('deve retornar false para token null', () => {
      expect(isAdmin(null)).toBe(false);
    });

    it('deve retornar false para token vazio', () => {
      expect(isAdmin('')).toBe(false);
    });
  });
});