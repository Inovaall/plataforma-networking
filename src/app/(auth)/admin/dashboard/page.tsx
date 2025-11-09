// src/app/(auth)/admin/dashboard/page.tsx
import { DashboardStats } from '@/components/features/dashboard/DashboardStats';

export const metadata = {
  title: 'Dashboard | Admin',
  description: 'Painel de métricas e desempenho da plataforma',
};

export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Visão geral de métricas e desempenho da plataforma de networking
        </p>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats />
    </div>
  );
}