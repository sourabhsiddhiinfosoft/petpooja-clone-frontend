import DashboardLayout from '../../../components/DashboardLayout';

export default function OwnerPOS() {
  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
          <p className="text-gray-600">Point of Sale system for your restaurant</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">POS system page content will go here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
