import DashboardLayout from '../../../components/DashboardLayout';

export default function StaffItems() {
  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Items</h1>
          <p className="text-gray-600">View restaurant menu items</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Items page content will go here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
