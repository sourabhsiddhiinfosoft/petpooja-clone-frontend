import DashboardLayout from "../../../components/DashboardLayout";
import WaiterDashboardPage from "../waiterDashboardPage/page";

export default function WaiterDashboard() {
  return (
    <DashboardLayout userType="waiter">
      <WaiterDashboardPage />
    </DashboardLayout>
  );
}