// src/app/(public)/aplicar/page.tsx
import { ApplicationForm } from '@/components/features/applications/ApplicationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Candidate-se | Plataforma de Networking',
  description: 'Envie sua intenção de participar do nosso grupo de networking profissional',
};

export default function AplicarPage() {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Junte-se ao Nosso Grupo
          </h1>
          <p className="text-lg text-gray-600">
            Preencha o formulário abaixo e envie sua intenção de participação
          </p>
        </div>

        {/* Benefícios */}
        <Card className="mb-6 bg-white/80 backdrop-blur border-indigo-200">
          <CardHeader>
            <CardTitle className="text-xl text-indigo-900">Por que participar?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Networking qualificado com profissionais de diversas áreas</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Oportunidades de negócios através de indicações qualificadas</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Reuniões periódicas para troca de experiências e aprendizado</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Acompanhamento de desempenho e métricas de resultados</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Comunidade ativa focada em geração de valor mútuo</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Formulário */}
        <Card className="bg-white shadow-xl border-indigo-200">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardTitle>Formulário de Intenção</CardTitle>
            <CardDescription>
              Todos os campos marcados com * são obrigatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ApplicationForm />
          </CardContent>
        </Card>

        {/* Info adicional */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur px-4 py-2 rounded-full">
            <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Resposta em até 5 dias úteis</span>
          </div>
        </div>
      </div>
    </div>
  );
}