// src/components/features/applications/__tests__/ApplicationForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationForm } from '../ApplicationForm';

// Mock fetch
global.fetch = jest.fn();

describe('ApplicationForm', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('deve renderizar todos os campos', () => {
    render(<ApplicationForm />);
    
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/por que você quer participar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar candidatura/i })).toBeInTheDocument();
  });

  it('deve mostrar erros de validação', async () => {
    const user = userEvent.setup();
    render(<ApplicationForm />);
    
    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });
    await user.click(submitButton);
    
    // React Hook Form mostra erros após submit
    await waitFor(() => {
      expect(screen.getByText(/nome deve ter no mínimo 2 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });
    
    render(<ApplicationForm />);
    
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
    await user.type(screen.getByLabelText(/empresa/i), 'Tech Co');
    await user.type(
      screen.getByLabelText(/por que você quer participar/i),
      'A'.repeat(50)
    );
    
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/applications',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('deve mostrar mensagem de sucesso após submissão', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });
    
    render(<ApplicationForm />);
    
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
    await user.type(screen.getByLabelText(/empresa/i), 'Tech Co');
    await user.type(
      screen.getByLabelText(/por que você quer participar/i),
      'A'.repeat(50)
    );
    
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));
    
    // Buscar pelo título do card de sucesso ao invés do texto quebrado
    await waitFor(() => {
      expect(screen.getByText('✅ Candidatura Enviada!')).toBeInTheDocument();
    });
  });

  it('deve mostrar erro quando API falha', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ 
        success: false, 
        error: { message: 'Email já cadastrado' } 
      }),
    });
    
    render(<ApplicationForm />);
    
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
    await user.type(screen.getByLabelText(/empresa/i), 'Tech Co');
    await user.type(
      screen.getByLabelText(/por que você quer participar/i),
      'A'.repeat(50)
    );
    
    await user.click(screen.getByRole('button', { name: /enviar candidatura/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email já cadastrado/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão durante submissão', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<ApplicationForm />);
    
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/email/i), 'joao@test.com');
    await user.type(screen.getByLabelText(/empresa/i), 'Tech Co');
    await user.type(
      screen.getByLabelText(/por que você quer participar/i),
      'A'.repeat(50)
    );
    
    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/enviando/i)).toBeInTheDocument();
  });
});