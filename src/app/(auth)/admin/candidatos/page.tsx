import { ApplicationList } from '@/components/features/applications/ApplicationList';

export default function AdminCandidatosPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestão de Candidaturas
        </h1>
        <p className="mt-2 text-gray-600">
          Aprove ou rejeite candidaturas de novos membros
        </p>
      </div>

      <ApplicationList />
    </div>
  );
}