'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberSchema, type MemberInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';

const EXPERTISE_OPTIONS = [
  'Tecnologia',
  'Vendas',
  'Marketing',
  'Finanças',
  'Recursos Humanos',
  'Jurídico',
  'Consultoria',
  'Design',
  'Educação',
  'Saúde',
];

export function MemberForm({ token }: { token: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberInput>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      inviteToken: token,
      expertise: [],
    },
  });

  const toggleExpertise = (item: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const onSubmit = async (data: MemberInput) => {
    if (selectedExpertise.length === 0) {
      setError('Selecione ao menos uma área de expertise');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          expertise: selectedExpertise,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao completar cadastro');
      }

      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao completar cadastro');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cadastro completo!
        </h2>
        <p className="text-gray-600">
          Bem-vindo à plataforma de networking!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <input type="hidden" {...register('inviteToken')} />

      <div>
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="+55 11 98765-4321"
          className="mt-1"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="position">Cargo / Posição</Label>
        <Input
          id="position"
          {...register('position')}
          placeholder="CEO, Diretor, Gerente..."
          className="mt-1"
        />
        {errors.position && (
          <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="bio">Bio / Sobre você</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Conte um pouco sobre sua experiência profissional..."
          rows={4}
          className="mt-1"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div>
        <Label>Áreas de Expertise *</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {EXPERTISE_OPTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleExpertise(item)}
              className={`px-3 py-2 text-sm rounded border transition-colors ${
                selectedExpertise.includes(item)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        {selectedExpertise.length === 0 && (
          <p className="mt-1 text-sm text-red-600">
            Selecione ao menos uma área
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Finalizando...' : 'Finalizar cadastro'}
      </Button>
    </form>
  );
}