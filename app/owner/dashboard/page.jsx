import DashboardLayout from '../../../components/DashboardLayout';
import DashboardContent from '../../../components/DashboardContent';

export default function OwnerDashboard() {
  return (
    <DashboardLayout userType="owner">
      <DashboardContent userType="owner" />
    </DashboardLayout>
  );
}
