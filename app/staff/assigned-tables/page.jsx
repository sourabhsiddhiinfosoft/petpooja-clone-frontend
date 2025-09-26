import DashboardLayout from '../../../components/DashboardLayout';

export default function StaffAssignedTables() {
  return (
    <DashboardLayout userType="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assigned Tables</h1>
          <p className="text-gray-600">Create orders for assigned tables</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-500">Assigned tables view will go here...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}


