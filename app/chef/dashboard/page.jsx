import DashboardLayout from "../../../components/DashboardLayout";
import ChefDashboardPage from "../chefDashboardPage/page";

export default function WaiterDashboard() {
  return (
    <DashboardLayout userType="chef">
      <ChefDashboardPage />
    </DashboardLayout>
  );
}