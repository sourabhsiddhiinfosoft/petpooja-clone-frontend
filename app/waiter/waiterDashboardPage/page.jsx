"use client"

import { useCurrentBranch } from "../../../store/hooks/useCurrentBranch";

export default function WaiterDashboardPage() {
    const { user } = useCurrentBranch();
    console.log(user)
    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

                <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Waiter'}</h1>
                <p className="text-md">Branch: {user?.branchName || 'N/A'}</p>
                <p className="text-md">Email: {user?.email || 'N/A'}</p>
                <p className="text-md">Phone: {user?.phone || 'N/A'}</p>
                <p className="mt-4">GO on Take Order Tab and manage your orders!</p>
               
            </div>
        </div>
    )
}