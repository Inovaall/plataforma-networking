// src/components/features/applications/ApplicationForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, type ApplicationInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Erro ao enviar candidatura');
      }

      setSubmitSuccess(true);
      reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao enviar candidatura');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">✅ Candidatura Enviada!</CardTitle>
          <CardDescription>
            Sua candidatura foi enviada com sucesso. Em breve você receberá um retorno da nossa equipe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setSubmitSuccess(false)} variant="outline">
            Enviar Nova Candidatura
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Seu nome completo"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="seu@email.com"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa *</Label>
        <Input
          id="company"
          {...register('company')}
          placeholder="Nome da sua empresa"
          disabled={isSubmitting}
        />
        {errors.company && (
          <p className="text-sm text-red-600">{errors.company.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="motivation">Por que você quer participar? *</Label>
        <Textarea
          id="motivation"
          {...register('motivation')}
          placeholder="Conte-nos sobre suas motivações e o que você espera do grupo (mínimo 50 caracteres)"
          rows={5}
          disabled={isSubmitting}
        />
        {errors.motivation && (
          <p className="text-sm text-red-600">{errors.motivation.message}</p>
        )}
        <p className="text-xs text-gray-500">Mínimo 50 caracteres</p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Enviar Candidatura'}
      </Button>
    </form>
  );
}