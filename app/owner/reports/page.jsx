"use client";
import React, { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useCurrentBranch } from "../../../store/hooks/useCurrentBranch";
import { useGetSalesReportQuery, useGetTopItemsQuery } from "../../../store/api/ownerApi";
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  CalendarDaysIcon, 
  ChartBarIcon, 
  CurrencyRupeeIcon, 
  ShoppingBagIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Custom Tailwind-based UI Components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
    {children}
  </div>
);

const CardTitle = ({ children, icon }) => (
  <div className="flex items-center gap-2">
    {icon && <span className="text-blue-600">{icon}</span>}
    <h3 className="text-lg font-semibold text-gray-900">{children}</h3>
  </div>
);

const CardContent = ({ children }) => (
  <div className="p-6">
    {children}
  </div>
);

// Fixed Tabs Component: Recursively passes props to nested children
const Tabs = ({ value, onValueChange, children }) => {
  const [activeTab, setActiveTab] = useState(value);
  useEffect(() => setActiveTab(value), [value]);
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange(newValue);
  };

  const renderChildren = (child) => {
    if (React.isValidElement(child)) {
      if (child.type === TabsTrigger) {
        return React.cloneElement(child, { activeTab, onTabChange: handleTabChange });
      }
      if (child.type === TabsContent) {
        return React.cloneElement(child, { activeTab });
      }
      if (child.props.children) {
        return React.cloneElement(child, {
          children: React.Children.map(child.props.children, renderChildren)
        });
      }
    }
    return child;
  };

  return <div>{React.Children.map(children, renderChildren)}</div>;
};

const TabsList = ({ children }) => (
  <div className="flex border-b border-gray-200 bg-gray-100 rounded-t-lg">
    {children}
  </div>
);

const TabsTrigger = ({ value, children, activeTab, onTabChange }) => (
  <button
    className={`px-6 py-3 text-sm font-medium transition-colors ${
      activeTab === value
        ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
    }`}
    onClick={() => onTabChange(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, activeTab, children }) => (
  activeTab === value ? <div className="mt-4">{children}</div> : null
);

const Input = (props) => (
  <input
    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full transition"
    {...props}
  />
);

const Select = ({ value, onValueChange, children }) => (
  <select
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full transition"
  >
    {children}
  </select>
);

const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

export default function ReportsPage() {
  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || "";
  const [branchId, setBranchId] = useState(currentBranch?._id || "");
  const [from, setFrom] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]; // First day of current month
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]); // Today
  const [activeTab, setActiveTab] = useState("sales");
  const [fetchData, setFetchData] = useState(false); // Trigger for queries

  const { data: salesData, isLoading: salesLoading, error: salesError } = useGetSalesReportQuery(
    { restaurantId, branchId, from, to },
    { skip: !fetchData || !restaurantId } // Only fetch when triggered
  );
  const { data: topItems, isLoading: topItemsLoading, error: topItemsError } = useGetTopItemsQuery(
    { restaurantId, branchId, from, to },
    { skip: !fetchData || !restaurantId }
  );

  useEffect(() => {
    setBranchId(currentBranch?._id || "");
    setFetchData(true)
  }, [currentBranch]);

  // Calculate summary stats
  const totalRevenue = salesData?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0;
  const totalOrders = salesData?.reduce((sum, item) => sum + (item.orders || 0), 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Transform sales data for Bar chart
  const salesChartData = {
    labels: salesData?.map(item => item?.date || '') || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: salesData?.map(item => item.revenue || 0) || [],
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderColor: '#4F46E5',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Sales Revenue by Day' },
      tooltip: { callbacks: { label: (context) => `₹${context.parsed.y.toFixed(2)}` } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: (value) => `₹${value}` } },
    },
  };

  // Transform top items data for Pie chart
  const topItemsChartData = {
    labels: topItems?.map(item => item._id || '') || [],
    datasets: [
      {
        data: topItems?.map(item => item.revenue || 0) || [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6B6B', '#4ECDC4',
        ],
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6B6B', '#4ECDC4',
        ],
        borderWidth: 2,
      },
    ],
  };

  const topItemsChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Top Items by Revenue' },
      tooltip: { callbacks: { label: (context) => `₹${context.parsed.toFixed(2)}` } },
    },
  };

  const handleFetchData = () => {
    if (from && to) {
      setFetchData(true);
    } else {
      alert('Please select both From and To dates.');
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
              Reports Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Analyze your sales and top items with detailed insights.</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Branch Dropdown */}
            <div className="w-full">
            <div className="w-[200px]">
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectItem value="">All Branches</SelectItem>
                {branches?.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-gray-500">to</span>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>

            {/* Fetch Button */}
            <button
              onClick={handleFetchData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <ArrowPathIcon className="h-5 w-5" />
              Fetch Data
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {fetchData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</p>
                  </div>
                  <CurrencyRupeeIcon className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Total Orders</p>
                    <p className="text-2xl font-bold">{totalOrders}</p>
                  </div>
                  <ShoppingBagIcon className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">Avg Order Value</p>
                    <p className="text-2xl font-bold">₹{avgOrderValue.toFixed(2)}</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="top">Top Items</TabsTrigger>
          </TabsList>

          {/* Sales Report */}
          <TabsContent value="sales" activeTab={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle icon={<ChartBarIcon className="h-6 w-6" />}>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {salesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : salesError ? (
                  <div className="text-center py-12">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600">Failed to load sales data. Try again.</p>
                  </div>
                ) : salesData?.length ? (
                  <>
                    <div className="h-80 mb-6">
                      <Bar data={salesChartData} options={salesChartOptions} />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border rounded-lg">
                        <thead className="bg-gray-100 text-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-right">Orders</th>
                            <th className="px-4 py-3 text-right">Revenue (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesData.map((row, i) => (
                            <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                              <td className="px-4 py-3">{row?.date || 'N/A'}</td>
                              <td className="px-4 py-3 text-right">{row.orders || 0}</td>
                              <td className="px-4 py-3 text-right font-semibold">₹{(row.revenue || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No sales data found for the selected period.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Top Items */}
          <TabsContent value="top" activeTab={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle icon={<ShoppingBagIcon className="h-6 w-6" />}>Top Selling Items</CardTitle>
              </CardHeader>
              <CardContent>
                {topItemsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : topItemsError ? (
                  <div className="text-center py-12">
                    <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600">Failed to load top items data. Try again.</p>
                  </div>
                ) : topItems?.length ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border rounded-lg">
                        <thead className="bg-gray-100 text-gray-600">
                          <tr>
                            <th className="px-4 py-3 text-left">Item</th>
                            <th className="px-4 py-3 text-right">Qty</th>
                            <th className="px-4 py-3 text-right">Revenue (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topItems.map((item, i) => (
                            <tr key={i} className={`border-t ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                              <td className="px-4 py-3">{item._id || 'N/A'}</td>
                              <td className="px-4 py-3 text-right">{item.qty || 0}</td>
                              <td className="px-4 py-3 text-right font-semibold">₹{(item.revenue || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="h-80">
                      <Pie data={topItemsChartData} options={topItemsChartOptions} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No top items data found for the selected period.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
