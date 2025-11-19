// pages/settings/restaurant.js
"use client";
import DashboardLayout from "../../components/DashboardLayout";
import SettingsForm from "../../components/SettingsForm";
import { useCurrentBranch } from "../../store/hooks/useCurrentBranch";

export default function RestaurantSettingsPage() {
  const { user } = useCurrentBranch();
  if (user.role !== 'owner') return <div>Access Denied</div>;

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold">Restaurant Settings</h1>
          <SettingsForm type="restaurant" restaurantId={user.restaurantId} />
        </div>
      </div>
    </DashboardLayout>
  );
}