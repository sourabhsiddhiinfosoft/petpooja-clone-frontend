import DashboardLayout from '../../../components/DashboardLayout';

export default function AdminProfile() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Profile management page content will go here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
