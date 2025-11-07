import { ApplicationForm } from '@/components/features/applications/ApplicationForm';

export default function AplicarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Junte-se ao nosso grupo
          </h1>
          <p className="text-lg text-gray-600">
            Preencha o formulário abaixo para manifestar seu interesse
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <ApplicationForm />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Sua candidatura será avaliada pela nossa equipe
        </div>
      </div>
    </div>
  );
}