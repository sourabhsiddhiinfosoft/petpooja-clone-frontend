// pages/settings/profile.js
"use client";

import DashboardLayout from "../../../../components/DashboardLayout";
import SettingsForm from "../../../../components/SettingsForm";
import { useCurrentBranch } from "../../../../store/hooks/useCurrentBranch";

export default function ProfileSettingsPage() {
  const { user } = useCurrentBranch();

  return (
    <DashboardLayout userType={'owner'}>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <SettingsForm type="user" userId={user?.id} />
        </div>
      </div>
    </DashboardLayout>
  );
}