import DashboardLayout from '../../../components/DashboardLayout';

export default function OwnerSettings() {
  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your restaurant settings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Settings page content will go here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
