import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplicationForm } from '../ApplicationForm';

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock do fetch
global.fetch = jest.fn();

describe('ApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário com todos os campos', () => {
    render(<ApplicationForm />);

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/empresa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/por que você quer participar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar candidatura/i })).toBeInTheDocument();
  });

  it('deve mostrar erros de validação quando campos vazios', async () => {
    render(<ApplicationForm />);

    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/nome deve ter no mínimo 2 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar erro para motivação curta', async () => {
    render(<ApplicationForm />);

    const motivationInput = screen.getByLabelText(/por que você quer participar/i);
    fireEvent.change(motivationInput, { target: { value: 'Curta' } });
    fireEvent.blur(motivationInput);

    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/motivação deve ter no mínimo 50 caracteres/i)).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {}, message: 'Sucesso' }),
    });

    render(<ApplicationForm />);

    // Preencher formulário
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/empresa/i), {
      target: { value: 'Tech Solutions' },
    });
    fireEvent.change(screen.getByLabelText(/por que você quer participar/i), {
      target: { value: 'A'.repeat(50) },
    });

    // Submeter
    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/applications', expect.any(Object));
    });
  });

  it('deve mostrar mensagem de sucesso após submissão', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {}, message: 'Sucesso' }),
    });

    render(<ApplicationForm />);

    // Preencher e submeter
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/empresa/i), {
      target: { value: 'Tech Solutions' },
    });
    fireEvent.change(screen.getByLabelText(/por que você quer participar/i), {
      target: { value: 'A'.repeat(50) },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => {
      expect(screen.getByText(/candidatura enviada com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem de erro quando API falha', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: { message: 'Email já cadastrado' },
      }),
    });

    render(<ApplicationForm />);

    // Preencher e submeter
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/empresa/i), {
      target: { value: 'Tech Solutions' },
    });
    fireEvent.change(screen.getByLabelText(/por que você quer participar/i), {
      target: { value: 'A'.repeat(50) },
    });

    fireEvent.click(screen.getByRole('button', { name: /enviar candidatura/i }));

    await waitFor(() => {
      expect(screen.getByText(/email já cadastrado/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão durante submissão', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ success: true }),
              }),
            100
          )
        )
    );

    render(<ApplicationForm />);

    // Preencher formulário
    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'João Silva' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'joao@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/empresa/i), {
      target: { value: 'Tech Solutions' },
    });
    fireEvent.change(screen.getByLabelText(/por que você quer participar/i), {
      target: { value: 'A'.repeat(50) },
    });

    const submitButton = screen.getByRole('button', { name: /enviar candidatura/i });
    fireEvent.click(submitButton);

    // Botão deve estar desabilitado durante submissão
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });
});