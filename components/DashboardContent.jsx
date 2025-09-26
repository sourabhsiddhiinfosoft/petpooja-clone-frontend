'use client';

import { useState } from 'react';
import { useGetAdminDashboardSummaryQuery } from '../store/api/adminApi';

const DashboardContent = ({ userType = 'admin' }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [selectedCustomerPeriod, setSelectedCustomerPeriod] = useState('Yearly-2024');
  // const { data:adminDashboardSummary, isLoading, isError } = useGetAdminDashboardSummaryQuery();
  
  // console.log("Admin Dashboard Summary:", adminDashboardSummary, isLoading, isError);
  
  // Role-based metrics
  const metrics = (
    userType === 'admin'
      ? [
          { label: 'Active Restaurants', value: '248', icon: '🏪', color: 'bg-indigo-500' },
          { label: 'Owners', value: '128', icon: '👤', color: 'bg-sky-500' },
          // { label: 'Active Subscriptions', value: '212', icon: '🔔', color: 'bg-emerald-500' },
          // { label: 'Expired Subscriptions', value: '36', icon: '⏰', color: 'bg-amber-500' },
          { label: 'Monthly Revenue', value: '$84,920', icon: '💵', color: 'bg-purple-500' },
          { label: 'Support Tickets', value: '32', icon: '🎫', color: 'bg-rose-500' },
        ]
      : userType === 'owner'
      ? [
          { label: "Today's Revenue", value: '$4,920', icon: '💵', color: 'bg-emerald-500' },
          { label: 'Total Orders', value: '12,431', icon: '🧾', color: 'bg-sky-500' },
          { label: 'Active Tables', value: '18/24', icon: '🪑', color: 'bg-indigo-500' },
          { label: 'Pending Orders', value: '12', icon: '⏳', color: 'bg-amber-500' },
          { label: 'Menu Items', value: '156', icon: '🍽️', color: 'bg-purple-500' },
          { label: 'Staff Members', value: '22', icon: '👷', color: 'bg-rose-500' },
        ]
      : [
          { label: 'My Orders Today', value: '24', icon: '🧾', color: 'bg-sky-500' },
          { label: 'Avg. Serve Time', value: '9m', icon: '⏱️', color: 'bg-emerald-500' },
          { label: 'Tips Today', value: '$86', icon: '💵', color: 'bg-amber-500' },
          { label: 'Tables Assigned', value: '6', icon: '🪑', color: 'bg-indigo-500' },
          { label: 'Pending KOT', value: '3', icon: '🧾', color: 'bg-purple-500' },
          { label: 'Bills to Close', value: '2', icon: '💳', color: 'bg-rose-500' },
        ]
  );

  const recentOrders = [
    { id: "ORD-001", type: "Dine-in", customer: "John Doe", amount: "$45.50", status: "Completed", date: "2024-01-15 14:30" },
    { id: "ORD-002", type: "Takeaway", customer: "Jane Smith", amount: "$23.75", status: "Preparing", date: "2024-01-15 14:25" },
    { id: "ORD-003", type: "Delivery", customer: "Mike Johnson", amount: "$67.20", status: "Delivered", date: "2024-01-15 14:20" },
    { id: "ORD-004", type: "Dine-in", customer: "Sarah Wilson", amount: "$34.90", status: "Pending", date: "2024-01-15 14:15" },
    { id: "ORD-005", type: "Takeaway", customer: "David Brown", amount: "$28.40", status: "Completed", date: "2024-01-15 14:10" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Preparing': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Manage your product, Branch and best deals</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center text-white text-lg`}>
                {metric.icon}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section (generic visuals; labels adapt) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Daily Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">$12,874</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
          <div className="h-64">
            <div className="flex items-end justify-between h-full space-x-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                const height = [20, 35, 45, 60, 40, 55, 70][index];
                return (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total Customers Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Customers</h3>
              <p className="text-2xl font-bold text-gray-900">12,097</p>
            </div>
            <select
              value={selectedCustomerPeriod}
              onChange={(e) => setSelectedCustomerPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Yearly-2024">Yearly-2024</option>
              <option value="Yearly-2023">Yearly-2023</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <div className="h-64">
            <div className="flex items-end justify-between h-full space-x-1">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => {
                const height = [30, 45, 35, 50, 40, 60, 55, 45, 50, 40, 35, 30][index];
                return (
                  <div key={month} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date and Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
