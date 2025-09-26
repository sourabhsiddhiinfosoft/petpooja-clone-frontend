import DashboardLayout from '../../../components/DashboardLayout';

export default function AdminSubscriptions() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600">Manage restaurant subscription status (active/expired)</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Admin can manage subscriptions here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}


