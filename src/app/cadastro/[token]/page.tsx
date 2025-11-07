import { MemberForm } from '@/components/features/applications/MemberForm';

export default function CadastroPage({ params }: { params: { token: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete seu cadastro
          </h1>
          <p className="text-lg text-gray-600">
            Sua candidatura foi aprovada! Preencha os dados abaixo para finalizar
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <MemberForm token={params.token} />
        </div>
      </div>
    </div>
  );
}