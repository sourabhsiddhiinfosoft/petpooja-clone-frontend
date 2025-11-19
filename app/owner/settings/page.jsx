"use client";
import { useState } from "react";
import DashboardLayout from '../../../components/DashboardLayout';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import SettingsForm from "../../../components/SettingsForm";

export default function OwnerSettings() {
  const { user,currentBranch } = useCurrentBranch();
  const [activeTab, setActiveTab] = useState('personal'); // Default to personal settings
  const branchId = currentBranch?._id;

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your personal and restaurant settings</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'personal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Personal Settings
            </button>
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'restaurant' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Restaurant Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Settings</h2>
            <SettingsForm type="user" userId={user?._id}/>
          </div>
        )}

        {activeTab === 'restaurant' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Restaurant Settings(By-Branch)</h2>
            <SettingsForm type="restaurant" restaurantId={user?.restaurantId} branchId={branchId}/>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
