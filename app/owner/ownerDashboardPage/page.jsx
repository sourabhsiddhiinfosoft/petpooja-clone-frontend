"use client";
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { formatDateToDDMMYY } from "../../../lib/dateConvertion";
import { useGetOwnerCustomerStatsQuery, useGetOwnerDashboardQuery, useGetOwnerRevenueQuery } from "../../../store/api/ownerApi";
import { CurrencyDollarIcon, ShoppingBagIcon, TableCellsIcon, ClockIcon, DocumentTextIcon, UsersIcon } from "@heroicons/react/24/outline"; // Add icons
import { ChartSkeleton, DashboardSkeleton } from "../../../components/Loading/ownerDashboardSkeleton";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const OwnerDashboardPage = () => {
  const [revenueType, setRevenueType] = useState("weekly");
  const [customerType, setCustomerType] = useState("yearly");

  // Fetch data
  const { data: dashboard, isLoading: loadingDashboard } = useGetOwnerDashboardQuery();
  const { data: revenueData, isLoading: loadingRevenue } = useGetOwnerRevenueQuery({
    period: revenueType,
    year: new Date().getFullYear(),
  });
  const { data: customerData, isLoading: loadingCustomers } = useGetOwnerCustomerStatsQuery({
    period: customerType,
    year: new Date().getFullYear(),
  });

  // Summary cards data with icons
  const cards = [
    { title: "Today Revenue", value: `₹${dashboard?.todayRevenue || 0}`, icon: CurrencyDollarIcon, color: "bg-gradient-to-r from-blue-500 to-blue-600" },
    { title: "Total Orders", value: dashboard?.totalOrders || 0, icon: ShoppingBagIcon, color: "bg-gradient-to-r from-green-500 to-green-600" },
    { title: "Active Tables", value: dashboard?.activeTables || "0/0", icon: TableCellsIcon, color: "bg-gradient-to-r from-purple-500 to-purple-600" },
    { title: "Pending Orders", value: dashboard?.pendingOrders || 0, icon: ClockIcon, color: "bg-gradient-to-r from-yellow-500 to-yellow-600" },
    { title: "Menu Items", value: dashboard?.menuItems || 0, icon: DocumentTextIcon, color: "bg-gradient-to-r from-indigo-500 to-indigo-600" },
    { title: "Staff Members", value: dashboard?.staffMembers || 0, icon: UsersIcon, color: "bg-gradient-to-r from-pink-500 to-pink-600" },
  ];

  // Chart.js data
  const revenueChartData = {
    labels: revenueData?.revenue?.map((item) => item._id) || [],
    datasets: [
      {
        label: "Revenue",
        data: revenueData?.revenue?.map((item) => item.total) || [],
        backgroundColor: "rgba(59,130,246,0.8)",
        borderRadius: 4,
      },
    ],
  };

  const customerChartData = {
    labels: customerData?.stats?.map((item) => item._id) || [],
    datasets: [
      {
        label: "Customers",
        data: customerData?.stats?.map((item) => item.count) || [],
        backgroundColor: "rgba(16,185,129,0.8)",
        borderRadius: 4,
      },
    ],
  };

  if (loadingDashboard) {
    return <DashboardSkeleton />;  // Use the new skeleton component
  }

  return (
    <div className="min-h-screen bg-gray-50 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Dashboard</h1>
          <p className="text-gray-600">Monitor your restaurant's performance and insights</p>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className={`${c.color} text-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300`}
          >
            <c.icon className="h-8 w-8 mx-auto mb-2" />
            <h3 className="text-sm font-medium opacity-90">{c.title}</h3>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Revenue Overview</h2>
          <select
            value={revenueType}
            onChange={(e) => setRevenueType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 transition"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        {loadingRevenue ? (
          <ChartSkeleton />
        ) : (
          <div className="w-full h-80">
            <Bar data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        )}
      </div>

      {/* Customer Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Customer Growth</h2>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 transition"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        {loadingCustomers ? (
          <ChartSkeleton />
        ) : (
          <div className="w-full h-80">
            <Bar data={customerChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700">Order ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentOrders?.length ? (
                dashboard.recentOrders.map((o) => (
                  <tr key={o.orderId} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3">{o.orderId.slice(-6)}</td>
                    <td className="px-4 py-3">{o.customer}</td>
                    <td className="px-4 py-3 capitalize">{o.status}</td>
                    <td className="px-4 py-3 font-semibold">₹{o.total}</td>
                    <td className="px-4 py-3">{formatDateToDDMMYY(new Date(o.createdAt))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;