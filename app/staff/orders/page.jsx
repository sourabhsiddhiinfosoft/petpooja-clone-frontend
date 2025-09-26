import DashboardLayout from '../../../components/DashboardLayout';

export default function StaffOrders() {
  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">View and update pending/active orders, KOT status</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Orders list will go here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}


