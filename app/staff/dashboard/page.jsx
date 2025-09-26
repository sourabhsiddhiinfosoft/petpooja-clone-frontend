import DashboardLayout from '../../../components/DashboardLayout';
import DashboardContent from '../../../components/DashboardContent';

export default function StaffDashboard() {
  return (
    <DashboardLayout userType="staff">
      <DashboardContent userType="staff" />
    </DashboardLayout>
  );
}
