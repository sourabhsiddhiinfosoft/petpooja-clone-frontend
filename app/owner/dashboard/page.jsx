import DashboardLayout from '../../../components/DashboardLayout';
import DashboardContent from '../../../components/DashboardContent';
import OwnerDashboardPage from '../ownerDashboardPage/page';

export default function OwnerDashboard() {
  return (
    <DashboardLayout userType="owner">
      {/* <DashboardContent userType="owner" /> */}
      <OwnerDashboardPage />
    </DashboardLayout>
  );
}
