"use client";

import { useEffect, useState } from "react";
import { useGetOwnerDashboardQuery } from "../../../store/api/ownerApi";
import { TilesCardLoading } from "../../../components/Loading/TilesCardLoading";
// import { useGetOwnerDashboardSummaryQuery } from "../store/api/ownerApi";

const pageTitle = "Owner Dashboard";
const pageDescription = "Monitor your restaurant performance in real time";

const OwnerDashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("Weekly");
  const [selectedCustomerPeriod, setSelectedCustomerPeriod] =
    useState("Yearly-2025");

//   const {
//     data: dashboardSummary,
//     isLoading,
//     isError,
//   } = useGetOwnerDashboardSummaryQuery();

const {data: dashboardData,isLoading,isError} = useGetOwnerDashboardQuery();

// const [isLoading, setIsLoading] = useState(true);
// const [isError, setIsError] = useState(false);

// const dashboardData = {
//   "todayRevenue": 4500,
//   "totalOrders": 128,
//   "activeTables": "6/20",
//   "pendingOrders": 12,
//   "menuItems": 58,
//   "staffMembers": 14,
//   "dailyRevenue": [
//     { "_id": "2025-09-23", "total": 3200 },
//     { "_id": "2025-09-24", "total": 4100 },
//     { "_id": "2025-09-25", "total": 3800 },
//     { "_id": "2025-09-26", "total": 5000 },
//     { "_id": "2025-09-27", "total": 4200 },
//     { "_id": "2025-09-28", "total": 3900 },
//     { "_id": "2025-09-29", "total": 4500 }
//   ],
//   "totalCustomers": 230,
//   "yearlyCustomers": [
//     { "_id": 1, "count": 15 },
//     { "_id": 2, "count": 20 },
//     { "_id": 3, "count": 30 },
//     { "_id": 4, "count": 28 },
//     { "_id": 5, "count": 25 },
//     { "_id": 6, "count": 40 },
//     { "_id": 7, "count": 35 },
//     { "_id": 8, "count": 22 },
//     { "_id": 9, "count": 15 }
//   ],
//   "recentOrders": [
//     {
//       "orderId": "652c2d49c1a5ab23dfb3e91a",
//       "orderType": "Dine-in",
//       "customer": "Rahul Sharma",
//       "amount": 750,
//       "status": "Completed",
//       "createdAt": "2025-09-29T10:25:00.000Z"
//     },
//     {
//       "orderId": "652c2d49c1a5ab23dfb3e91b",
//       "orderType": "Delivery",
//       "customer": "Guest",
//       "amount": 1200,
//       "status": "Preparing",
//       "createdAt": "2025-09-29T09:45:00.000Z"
//     },
//     {
//       "orderId": "652c2d49c1a5ab23dfb3e91c",
//       "orderType": "Takeaway",
//       "customer": "Sneha Patel",
//       "amount": 600,
//       "status": "Completed",
//       "createdAt": "2025-09-29T09:20:00.000Z"
//     },
//     {
//       "orderId": "652c2d49c1a5ab23dfb3e91d",
//       "orderType": "Dine-in",
//       "customer": "Amit Verma",
//       "amount": 900,
//       "status": "Pending",
//       "createdAt": "2025-09-29T08:50:00.000Z"
//     },
//     {
//       "orderId": "652c2d49c1a5ab23dfb3e91e",
//       "orderType": "Delivery",
//       "customer": "Priya Singh",
//       "amount": 1050,
//       "status": "Delivered",
//       "createdAt": "2025-09-29T08:30:00.000Z"
//     }
//   ]
// }


if (isLoading) return <LoadingComponent />;

  if (isError) return <p>Error loading dashboard</p>;

  // Fallback if no data
  if (!dashboardData) return <p>No data available</p>;

  const {
    todayRevenue,
    totalOrders,
    activeTables,
    pendingOrders,
    menuItems,
    staffMembers,
    dailyRevenue,
    totalCustomers,
    yearlyCustomers,
    recentOrders,
  } = dashboardData;

  // Metrics for Owner
  const metrics = [
    {
      label: "Today's Revenue",
      value: `₹${todayRevenue}`,
      icon: "💵",
      color: "bg-emerald-500",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: "🧾",
      color: "bg-sky-500",
    },
    {
      label: "Active Tables",
      value: activeTables,
      icon: "🪑",
      color: "bg-indigo-500",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: "⏳",
      color: "bg-amber-500",
    },
    {
      label: "Menu Items",
      value: menuItems,
      icon: "🍽️",
      color: "bg-purple-500",
    },
    {
      label: "Staff Members",
      value: staffMembers,
      icon: "👷",
      color: "bg-rose-500",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Delivered":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-gray-600">{pageDescription}</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center text-white text-lg`}
              >
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Daily Revenue
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                ₹
                {dailyRevenue.reduce((sum, day) => sum + day.total, 0).toLocaleString()}
              </p>
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
          <div className="h-64 flex items-end justify-between space-x-1">
            {dailyRevenue.map((day, index) => {
              const height = (day.total / Math.max(...dailyRevenue.map(d => d.total))) * 100;
              const label = new Date(day._id).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-600 mt-2">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Customers Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Total Customers
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {totalCustomers}
              </p>
            </div>
            <select
              value={selectedCustomerPeriod}
              onChange={(e) => setSelectedCustomerPeriod(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Yearly-2025">Yearly-2025</option>
              <option value="Yearly-2024">Yearly-2024</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {yearlyCustomers.map((month) => {
              const height =
                (month.count /
                  Math.max(...yearlyCustomers.map((m) => m.count))) *
                100;
              const monthLabel = new Date(2025, month._id - 1).toLocaleString(
                "en-IN",
                { month: "short" }
              );
              return (
                <div
                  key={month._id}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-600 mt-2">
                    {monthLabel}
                  </span>
                </div>
              );
            })}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order?.orderType?.toUpperCase() || "DINE-IN"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ₹{order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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

export default OwnerDashboardPage;


const LoadingComponent = () =>(
  <div>
     <div className="space-y-6">
      {/* Page Header */}
      <div>
         <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-gray-600">{pageDescription}</p>
      </div>
    <TilesCardLoading />
    </div>
  </div>
)