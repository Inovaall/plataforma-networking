import { DashboardStats } from '@/components/features/dashboard/DashboardStats';

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do desempenho da plataforma
        </p>
      </div>

      <DashboardStats />
    </div>
  );
}