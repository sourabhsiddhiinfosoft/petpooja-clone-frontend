import DashboardLayout from '../../../components/DashboardLayout';
import AdminDashboardPage from '../adminDashboardPage/AdminDashboardPage';

export default function AdminDashboard() {
  return (
    <DashboardLayout userType="admin">
      <AdminDashboardPage userType="admin" />
    </DashboardLayout>
  );
}
