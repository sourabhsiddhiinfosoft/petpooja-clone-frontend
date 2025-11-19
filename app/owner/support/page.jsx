"use client";
import { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import SupportForm from "../../../components/SupportForm";
import TicketList from "../../../components/TicketList";
import { useCurrentBranch } from "../../../store/hooks/useCurrentBranch";
import { ChatBubbleLeftRightIcon, TicketIcon } from "@heroicons/react/24/outline";

export default function OwnerSupportPage() {
  const { user } = useCurrentBranch();
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'list'

  return (
    <DashboardLayout userType="owner">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-600" />
                  Support Center
                </h1>
                <p className="text-gray-600 mt-1">Get help, create tickets, and manage your support requests.</p>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex max-w-xl space-x-1 mt-6 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'create'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <TicketIcon className="h-4 w-4" />
                Create Ticket
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                My Tickets
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-opacity duration-300">
            {activeTab === 'create' && <SupportForm user={user} />}
            {activeTab === 'list' && <TicketList userId={user.id} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}