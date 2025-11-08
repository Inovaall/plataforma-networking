import { cn, formatDate, formatDateTime } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('deve combinar classes', () => {
      const result = cn('class-1', 'class-2');
      expect(result).toContain('class-1');
      expect(result).toContain('class-2');
    });

    it('deve lidar com classes condicionais', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toContain('base');
      expect(result).toContain('conditional');
      expect(result).not.toContain('hidden');
    });
  });

  describe('formatDate', () => {
    it('deve formatar data corretamente', () => {
      const date = new Date('2025-11-07');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('deve formatar string de data', () => {
      const formatted = formatDate('2025-11-07');
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
  });

  describe('formatDateTime', () => {
    it('deve formatar data e hora corretamente', () => {
      const date = new Date('2025-11-07T15:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });
});