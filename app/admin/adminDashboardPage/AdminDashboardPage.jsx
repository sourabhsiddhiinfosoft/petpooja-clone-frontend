"use client";
import { useSelector } from "react-redux";
import React from "react";
import {
    useGetAdminDashboardSummaryQuery,
    useGetRevenueQuery,
    useGetCustomersStatsQuery,
} from "../../../store/api/adminApi";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { TilesCardLoading } from "../../../components/Loading/TilesCardLoading";
import { ChartsLoading } from "../../../components/Loading/chartsLoading";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function AdminDashboardPage({ userType = "admin" }) {
    // Get user info from Redux (if needed for role)
    //   const user = useSelector((state) => state.auth.user);

    const [selectedCustomerPeriod, setSelectedCustomerPeriod] = React.useState(
        "Yearly-2024"
    );
    const [selectedPeriod, setSelectedPeriod] = React.useState("Monthly");
    const [revenuePeriod, setRevenuePeriod] = React.useState("monthly");
    const [customerPeriod, setCustomerPeriod] = React.useState("monthly");

    // Fetch dashboard summary (change hook if you have different APIs for other roles)
    const { data, isLoading, isError } = useGetAdminDashboardSummaryQuery();
    const { data: monthlyRevenue, isLoading: revenueLoading, isError: revenueError } =
        useGetRevenueQuery({ type: "monthly" });

    const { data: revenueData, isLoading: revenueLoadingGen } = useGetRevenueQuery({
        type: revenuePeriod,
        year: revenuePeriod === "yearly" ? 2025 : undefined,
        // add date param if using daily
    });

    const { data: customerData, isLoading: customerLoadingGen } = useGetCustomersStatsQuery({
        type: customerPeriod,
        year: customerPeriod === "monthly" ? 2025 : undefined,
    });

    const { data: monthlyCustomers, isLoading: customerLoading, isError: customerError } =
        useGetCustomersStatsQuery({ type: "monthly", year: 2025 });
    // const { data: yearlyCustomers } = useGetCustomersStatsQuery({ type: "yearly" });

    console.log("Monthly Revenue Data:", monthlyRevenue);
    console.log("Monthly Revenue Loading:", revenueLoading);
    console.log("Monthly Revenue Error:", revenueError);

    // You can add logic here to use a different API or data shape based on userType/role

    // Extract dashboard data safely
    const summary = data?.data || {};

    const revenueLabels =
        revenuePeriod === "weekly"
            ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            : revenuePeriod === "monthly"
                ? [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ]
                : revenuePeriod === "yearly"
                    ? [
                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                    ]
                    : [];

    const revenueChartData = {
        labels: revenueLabels,
        datasets: [
            {
                label: "Revenue",
                data:
                    revenueData?.revenue?.map((item) => item.total) ||
                    Array(revenueLabels.length).fill(0),
                borderColor: "#2563eb",
                backgroundColor: "rgba(37,99,235,0.2)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const customerLabels =
        customerPeriod === "monthly" || customerPeriod === "yearly"
            ? [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ]
            : [];

    const customerChartData = {
        labels: customerLabels,
        datasets: [
            {
                label: "Customers",
                data:
                    customerData?.stats?.map((item) => item.count) ||
                    Array(customerLabels.length).fill(0),
                backgroundColor: "#22d3ee",
            },
        ],
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {isLoading && <TilesCardLoading />}
            {isError && <div className="text-red-500">Failed to load dashboard data.</div>}

            {!isLoading && !isError && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-gray-500">Active Restaurants</div>
                        <div className="text-3xl font-bold">{summary.activeRestaurantsCount ?? 0}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-gray-500">Owners</div>
                        <div className="text-3xl font-bold">{summary.ownersCount ?? 0}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-gray-500">Monthly Revenue</div>
                        <div className="text-3xl font-bold">₹{summary.monthlyRevenue?.toFixed(2) ?? "0.00"}</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Line Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                        <select
                            value={revenuePeriod}
                            onChange={(e) => setRevenuePeriod(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="h-64">
                        {revenueLoading ? (
                            <ChartsLoading />
                        ) : (
                            <Line data={revenueChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        )}
                    </div>
                </div>

                {/* Customers Bar Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                        <select
                            value={customerPeriod}
                            onChange={(e) => setCustomerPeriod(e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="h-64">
                        {customerLoading ? (
                            <ChartsLoading />
                        ) : (
                            <Bar data={customerChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        )}
                    </div>
                </div>

            </div>


            {isLoading && <TilesCardLoading columns={2} />}
            {/* Recent Restaurants */}
            {!isLoading && !isError && summary.recentRestaurants && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Restaurants</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summary.recentRestaurants.map((r) => (
                            <div key={r._id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                                <img src={r.logo || "/images/No-Image-Placeholder.png"} alt={r.name} className="w-16 h-16 object-cover rounded" />
                                <div>
                                    <div className="font-bold">{r.name}</div>
                                    <div className="text-gray-500 text-sm">
                                        {r.city}, {r.state}, {r.country}
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        {/* {new Date(r.createdAt).toLocaleDateString()} */}
                                        {new Date(r.createdAt).toLocaleDateString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric",})}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
