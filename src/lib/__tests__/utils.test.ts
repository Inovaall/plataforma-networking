// src/lib/__tests__/utils.test.ts
import { cn, formatDate, formatDateTime, formatPhone, truncate, sleep } from '../utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('deve mesclar classes CSS', () => {
      const result = cn('text-red-500', 'bg-blue-500');
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('deve lidar com classes condicionais', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'not-included');
      expect(result).toContain('base-class');
      expect(result).toContain('conditional-class');
      expect(result).not.toContain('not-included');
    });

    it('deve lidar com undefined e null', () => {
      const result = cn('base-class', undefined, null);
      expect(result).toContain('base-class');
    });
  });

  describe('formatDate', () => {
    it('deve formatar data para PT-BR', () => {
      const date = new Date('2025-11-05T10:30:00Z');
      const result = formatDate(date);
      
      // Formato esperado: DD/MM/YYYY
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve aceitar string ISO', () => {
      const result = formatDate('2025-11-05T10:30:00Z');
      
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data e hora para PT-BR', () => {
      const date = new Date('2025-11-05T10:30:00Z');
      const result = formatDateTime(date);
      
      // Formato esperado: DD/MM/YYYY, HH:MM
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('deve aceitar string ISO', () => {
      const result = formatDateTime('2025-11-05T10:30:00Z');
      
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatPhone', () => {
    it('deve formatar telefone de 11 dígitos', () => {
      const result = formatPhone('11987654321');
      expect(result).toBe('(11) 98765-4321');
    });

    it('deve formatar telefone de 10 dígitos', () => {
      const result = formatPhone('1133334444');
      expect(result).toBe('(11) 3333-4444');
    });

    it('deve remover caracteres não numéricos', () => {
      const result = formatPhone('(11) 98765-4321');
      expect(result).toBe('(11) 98765-4321');
    });

    it('deve retornar original se formato inválido', () => {
      const result = formatPhone('123');
      expect(result).toBe('123');
    });
  });

  describe('truncate', () => {
    it('deve truncar texto longo', () => {
      const text = 'Este é um texto muito longo que precisa ser truncado';
      const result = truncate(text, 20);
      
      expect(result.length).toBeLessThanOrEqual(23); // 20 + '...'
      expect(result).toContain('...');
    });

    it('não deve truncar texto curto', () => {
      const text = 'Texto curto';
      const result = truncate(text, 20);
      
      expect(result).toBe(text);
      expect(result).not.toContain('...');
    });

    it('deve truncar exatamente no limite', () => {
      const text = 'Exatamente vinte car';
      const result = truncate(text, 20);
      
      expect(result).toBe(text);
    });
  });

  describe('sleep', () => {
    it('deve aguardar o tempo especificado', async () => {
      const start = Date.now();
      await sleep(100);
      const end = Date.now();
      
      const elapsed = end - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Margem de erro
      expect(elapsed).toBeLessThan(150);
    });

    it('deve retornar uma Promise', () => {
      const result = sleep(10);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});