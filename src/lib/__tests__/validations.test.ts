import { applicationSchema, memberSchema } from '../validations';

describe('applicationSchema', () => {
  it('deve aceitar dados válidos', () => {
    const validData = {
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Tech Solutions',
      motivation: 'A'.repeat(50), // 50 caracteres
    };

    expect(() => applicationSchema.parse(validData)).not.toThrow();
  });

  it('deve rejeitar nome muito curto', () => {
    const invalidData = {
      name: 'J',
      email: 'joao@empresa.com',
      company: 'Tech Solutions',
      motivation: 'A'.repeat(50),
    };

    expect(() => applicationSchema.parse(invalidData)).toThrow();
  });

  it('deve rejeitar email inválido', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'email-invalido',
      company: 'Tech Solutions',
      motivation: 'A'.repeat(50),
    };

    expect(() => applicationSchema.parse(invalidData)).toThrow();
  });

  it('deve rejeitar motivação muito curta', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Tech Solutions',
      motivation: 'Curta', // Menos de 50 caracteres
    };

    expect(() => applicationSchema.parse(invalidData)).toThrow();
  });

  it('deve rejeitar motivação muito longa', () => {
    const invalidData = {
      name: 'João Silva',
      email: 'joao@empresa.com',
      company: 'Tech Solutions',
      motivation: 'A'.repeat(1001), // Mais de 1000 caracteres
    };

    expect(() => applicationSchema.parse(invalidData)).toThrow();
  });
});

describe('memberSchema', () => {
  it('deve aceitar dados válidos', () => {
    const validData = {
      inviteToken: 'token_valido_123',
      phone: '+55 11 98765-4321',
      position: 'CEO',
      bio: 'Experiência profissional...',
      expertise: ['Tecnologia', 'Vendas'],
    };

    expect(() => memberSchema.parse(validData)).not.toThrow();
  });

  it('deve aceitar dados mínimos obrigatórios', () => {
    const validData = {
      inviteToken: 'token_valido_123',
      expertise: ['Tecnologia'],
    };

    expect(() => memberSchema.parse(validData)).not.toThrow();
  });

  it('deve rejeitar sem token', () => {
    const invalidData = {
      expertise: ['Tecnologia'],
    };

    expect(() => memberSchema.parse(invalidData)).toThrow();
  });

  it('deve rejeitar sem expertise', () => {
    const invalidData = {
      inviteToken: 'token_valido_123',
      expertise: [],
    };

    expect(() => memberSchema.parse(invalidData)).toThrow();
  });

  it('deve rejeitar bio muito longa', () => {
    const invalidData = {
      inviteToken: 'token_valido_123',
      bio: 'A'.repeat(501), // Mais de 500 caracteres
      expertise: ['Tecnologia'],
    };

    expect(() => memberSchema.parse(invalidData)).toThrow();
  });
});