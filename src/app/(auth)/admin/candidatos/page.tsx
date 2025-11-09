// src/app/(auth)/admin/candidatos/page.tsx
import { ApplicationList } from '@/components/features/applications/ApplicationList';

export const metadata = {
  title: 'Gestão de Candidatos | Admin',
  description: 'Administração de candidaturas de novos membros',
};

export default function AdminCandidatosPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestão de Candidatos
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Aprove ou rejeite candidaturas de novos membros. Ao aprovar, um link de convite será gerado automaticamente.
        </p>
      </div>

      {/* Alert Info */}
      <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-indigo-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-indigo-800">Como funciona</h3>
            <div className="mt-2 text-sm text-indigo-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>Aprovar:</strong> Gera um link de convite único que permite o candidato completar o cadastro
                </li>
                <li>
                  <strong>Rejeitar:</strong> Marca a candidatura como rejeitada (sem notificação automática)
                </li>
                <li>
                  O link de convite expira em 7 dias após a aprovação
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total de Candidaturas</dt>
                  <dd className="text-lg font-semibold text-gray-900">-</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Aguardando Revisão</dt>
                  <dd className="text-lg font-semibold text-gray-900">-</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Aprovadas este Mês</dt>
                  <dd className="text-lg font-semibold text-gray-900">-</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Candidaturas */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <ApplicationList />
        </div>
      </div>
    </div>
  );
}