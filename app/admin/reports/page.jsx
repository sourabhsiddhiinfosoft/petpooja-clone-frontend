import DashboardLayout from '../../../components/DashboardLayout';

export default function AdminReports() {
  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">View revenue and restaurant statistics</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Reporting dashboard will go here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}


