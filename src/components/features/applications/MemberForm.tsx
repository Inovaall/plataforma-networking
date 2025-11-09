// src/components/features/applications/MemberForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSchema, type MemberInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface MemberFormProps {
  token: string;
}

const EXPERTISE_OPTIONS = [
  'Tecnologia',
  'Vendas',
  'Marketing',
  'Finanças',
  'Recursos Humanos',
  'Operações',
  'Jurídico',
  'Consultoria',
  'Design',
  'Engenharia',
];

export function MemberForm({ token }: MemberFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      inviteToken: token,
      expertise: [],
    },
  });

  const toggleExpertise = (item: string) => {
    const newExpertise = selectedExpertise.includes(item)
      ? selectedExpertise.filter(e => e !== item)
      : [...selectedExpertise, item];
    
    setSelectedExpertise(newExpertise);
    setValue('expertise', newExpertise);
  };

  const onSubmit = async (data: MemberInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao completar cadastro');
      }

      // Redirecionar para página de sucesso
      alert('Cadastro completo com sucesso! Bem-vindo à plataforma.');
      router.push('/');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao completar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="(11) 98765-4321"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">Cargo/Posição</Label>
        <Input
          id="position"
          {...register('position')}
          placeholder="CEO, Diretor, Gerente, etc."
          disabled={isSubmitting}
        />
        {errors.position && (
          <p className="text-sm text-red-600">{errors.position.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biografia</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Conte um pouco sobre sua trajetória profissional..."
          rows={4}
          disabled={isSubmitting}
        />
        {errors.bio && (
          <p className="text-sm text-red-600">{errors.bio.message}</p>
        )}
        <p className="text-xs text-gray-500">Máximo 500 caracteres</p>
      </div>

      <div className="space-y-2">
        <Label>Áreas de Expertise * (selecione ao menos uma)</Label>
        <div className="grid grid-cols-2 gap-2">
          {EXPERTISE_OPTIONS.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleExpertise(item)}
              className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                selectedExpertise.includes(item)
                  ? 'bg-blue-100 border-blue-500 text-blue-900'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={isSubmitting}
            >
              {item}
            </button>
          ))}
        </div>
        {errors.expertise && (
          <p className="text-sm text-red-600">{errors.expertise.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Finalizando cadastro...' : 'Finalizar Cadastro'}
      </Button>
    </form>
  );
}