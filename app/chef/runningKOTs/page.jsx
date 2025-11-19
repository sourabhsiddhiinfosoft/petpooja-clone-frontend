"use client";
import { useMemo, useState, useEffect } from 'react';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import {
  useGetKOTListQuery,
  useUpdateKOTStatusMutation
} from '../../../store/api/ownerApi'; // Adjust if in staffApi
import DashboardLayout from '../../../components/DashboardLayout';
import { TableLoading } from '../../../components/Loading/tableLoading';
import toast from 'react-hot-toast';
import { useNotifications } from '../../../contexts/NotificationContext';
import {
  MagnifyingGlassCircleIcon as SearchIcon,
  FunnelIcon,
  ClockIcon,
  FireIcon, // For preparing (kitchen heat)
  CheckCircleIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon // For refresh
} from '@heroicons/react/24/outline';
import { socket } from '../../../lib/socket';
import { printKotBill } from '../../../lib/printBill';

export default function ChefKOTs() {
  const { user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || '';
  const branchId = user?.branchId || ''; // Chef tied to branch

  // Build query string (same for both tabs; filter client-side for "Today")
  const q = `${restaurantId ? `restaurantId=${restaurantId}` : ''}${branchId ? `&branchId=${branchId}` : ''}`;


  const { data: kots = [], isLoading, isError, refetch } = useGetKOTListQuery(q, { skip: !restaurantId });
  const [updateKOTStatus] = useUpdateKOTStatusMutation();
  const { addNotificationHandler } = useNotifications();

  const [activeTab, setActiveTab] = useState('latest'); // 'latest' | 'today'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'preparing', 'ready'
  const [currentPage, setCurrentPage] = useState({ latest: 1, today: 1 }); // Per tab

  const itemsPerPage = 6;

  // Handle real-time notifications - auto-refresh when new KOT is created
  useEffect(() => {
    const unsubscribe = addNotificationHandler((notification) => {
      console.log('ChefKOTs: Received notification', notification);
      if (notification.type === 'kot_created') {
        // Auto-refresh KOT list when new KOT is created
        refetch();
        // Optional: Show a more specific toast
        toast.success(`New KOT received: ${notification.message}`);
      }
    });

    return unsubscribe;
  }, [addNotificationHandler, refetch]);

  useEffect(() => {
    socket.emit("joinUser", { userId: user?._id, role: "chef" });

    socket.on("notifyChef", (data) => {
      toast.success(data.message);
      console.log("Chef received:", data.kotData);
    });

    return () => {
      socket.off("notifyChef");
    };
  }, [user]);

  // Filter KOTs based on tab
  const filteredKots = useMemo(() => {
    let filtered = kots;

    // Tab filter: Latest (all, sorted desc) vs Today
    if (activeTab === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filtered = filtered.filter(kot => {
        const createdDate = new Date(kot.createdAt);
        return createdDate >= today && createdDate < tomorrow;
      });
    } // Latest: No filter, assume backend sorts by createdAt desc

    // Search filter
    if (search) {
      filtered = filtered.filter((kot) =>
        kot._id.toLowerCase().includes(search.toLowerCase()) || // KOT ID
        (kot.tableNo || '').toLowerCase().includes(search.toLowerCase()) || // Table
        kot.items.some(item =>
          item.name.toLowerCase().includes(search.toLowerCase()) // Item names
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((kot) => kot.status === statusFilter);
    }

    return filtered;
  }, [kots, activeTab, search, statusFilter]);

  // Pagination per tab
  const currentTabPage = currentPage[activeTab];
  const totalPages = Math.ceil(filteredKots.length / itemsPerPage);
  const paginatedKots = filteredKots.slice(
    (currentTabPage - 1) * itemsPerPage,
    currentTabPage * itemsPerPage
  );

  // Update page for active tab
  const updateCurrentPage = (page) => {
    setCurrentPage(prev => ({ ...prev, [activeTab]: page }));
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      preparing: 'bg-orange-100 text-orange-800 border-orange-300', // Chef "hot" theme
      ready: 'bg-green-100 text-green-800 border-green-300',
    };
    const icons = {
      pending: <ExclamationTriangleIcon className="h-3 w-3" />,
      preparing: <FireIcon className="h-3 w-3" />, // Fire for preparing
      ready: <CheckCircleIcon className="h-3 w-3" />,
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {icons[status] || <ClockIcon className="h-3 w-3" />}
        {status}
      </span>
    );
  };

    const handlePrintKOT = (kotData) => {
      if(!kotData || kotData.length === 0) return toast.error('No KOT data to print');
       const restaurant = {
      name: user?.restaurantName || 'Restaurant Billing',
    };
    const taxRate = 0; 
    const discount = kotData?.discount || 0;
    // Call the external function with params
    printKotBill({
      kotData,
      restaurant,
      taxRate, // Adjust as needed
      discount,
    });
      toast.success('KOT printed');
    };

  // Update KOT status handler
  const handleUpdateStatus = async (kotId, newStatus,cancelReason) => {
    try {
      console.log('Updating KOT status:', kotId, newStatus);
      await updateKOTStatus({ kotId, status: newStatus,cancelReason }).unwrap();
      toast.success(`KOT ${kotId.slice(-6).toUpperCase()} updated to ${newStatus}`);
      const waiterId = "68e754feb5f78a335c2fe215";
      socket.emit("kotStatusUpdated", { kotId, newStatus, waiterId });
      // toast.success(`KOT ${kotId} marked as ${newStatus}`);
      refetch(); // Refetch to update UI
    } catch (error) {
      console.error('Failed to update KOT status:', error);
      toast.error('Failed to update KOT status');
    }
  };

  // Tab content summary
  const getTabSummary = () => {
    if (activeTab === 'today') {
      const todayCount = kots.filter(kot => {
        const createdDate = new Date(kot.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return createdDate >= today && createdDate < tomorrow;
      }).length;
      return `Today's KOTs (${todayCount})`;
    }
    return `Latest KOTs (${kots.length})`;
  };

  if (isError) {
    toast.error('Failed to load KOTs');
  }

  return (
    <DashboardLayout userType="chef"> {/* Or "chef" if custom */}
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chef Dashboard - Kitchen Orders</h1>
              <p className="text-gray-600">Manage KOTs: Start preparing and mark ready for pickup</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={refetch}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {/* Tab Toggle */}
              <div className="flex border-b border-gray-200">
                {['latest', 'today'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setCurrentPage(prev => ({ ...prev, [tab]: 1 })); // Reset page on tab switch
                      setSearch(''); // Clear filters on switch
                      setStatusFilter('all');
                    }}
                    className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 ${activeTab === tab
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab === 'today' ? "Today's KOTs" : "Latest KOTs"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters (Search + Status) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'today' ? "today's" : ''} KOTs by ID, table, or items...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none w-full"
              />
            </div>
            {/* Status Filter */}
            <div className="relative sm:w-48">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none w-full"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
              </select>
            </div>
          </div>
        </div>

        {/* KOTs Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && <TableLoading columns={3} />}

          {isError && (
            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">Failed to load KOTs. Please refresh.</p>
              <button onClick={refetch} className="mt-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* Results Summary */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  {getTabSummary()} • Showing {paginatedKots.length} of {filteredKots.length} KOTs
                  {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
                  {search && ` • Search: "${search}"`}
                </p>
              </div>

              {/* Cards Grid */}
              <div className="p-6">
                {paginatedKots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedKots.map((kot) => (
                      <div key={kot._id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                        {/* Header: KOT Number & Status */}
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200"> {/* Chef "hot" gradient */}
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">KOT #{kot._id.slice(-6).toUpperCase()}</h3>
                              <p className="text-sm text-gray-600">Table: {kot.tableNo || 'N/A'}</p>
                            </div>
                            <StatusBadge status={kot.status} />
                          </div>
                        </div>

                        {/* Items List */}
                                    <div className="p-4 max-h-48 overflow-y-auto">
                                      {kot.items && kot.items.length > 0 ? (
                                      <ul className="space-y-2">
                                        {kot.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm">
                                          <span className="text-gray-700">{item.name}</span>
                                          <span className="font-medium text-orange-600">x{item.qty}</span>
                                        </li>
                                        ))}
                                      </ul>
                                      ) : (
                                      <p className="text-gray-500 text-sm italic">No items</p>
                                      )}
                                    </div>

                                    {/* Status Dropdown */}
                                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">Change Status:</span>

                                        {/* Determine allowed transitions */}
                                        <select
                                        value={kot.status}
                                        onChange={(e) => {
                                          const newStatus = e.target.value;
                                          if (newStatus !== kot.status) {
                                          handleUpdateStatus(kot._id, newStatus);
                                          }
                                        }}
                                        className="py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                                        aria-label={`Change status for KOT ${kot._id}`}
                                        >
                                        {(() => {
                                          const opts = [];
                                          if (kot.status === 'pending') {
                                          opts.push(<option key="pending" value="pending">Pending</option>);
                                          opts.push(<option key="preparing" value="preparing">Preparing</option>);
                                          opts.push(<option key="cancelled" value="cancelled">Cancelled</option>);
                                          } else if (kot.status === 'preparing') {
                                          opts.push(<option key="preparing" value="preparing">Preparing</option>);
                                          opts.push(<option key="ready" value="ready">Ready</option>);
                                          opts.push(<option key="cancelled" value="cancelled">Cancelled</option>);
                                          } else if (kot.status === 'ready') {
                                          opts.push(<option key="ready" value="ready">Ready</option>);
                                          } else if (kot.status === 'cancelled') {
                                          opts.push(<option key="cancelled" value="cancelled">Cancelled</option>);
                                          } else {
                                          opts.push(<option key="pending" value="pending">Pending</option>);
                                          opts.push(<option key="preparing" value="preparing">Preparing</option>);
                                          opts.push(<option key="ready" value="ready">Ready</option>);
                                          opts.push(<option key="cancelled" value="cancelled">Cancelled</option>);
                                          }
                                          return opts;
                                        })()}
                                        </select>
                                      </div>

                                      <div className="text-sm text-gray-500">
                                        <span className="hidden sm:inline">Current: </span>
                                        <StatusBadge status={kot.status} />
                                      </div>
                                      </div>
                                    </div>

                        <div className="p-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4" />
                              <span>{new Date(kot.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Total:</p>
                              <p className="font-bold text-lg text-orange-600">₹{kot?.orderId?.total?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                          {/* Optional Print Button */}
                          <button
                            onClick={() =>handlePrintKOT(kot)}
                            className="mt-3 w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 transition-all flex items-center justify-center gap-2 text-sm"
                          >
                            <PrinterIcon className="h-4 w-4" />
                            Print KOT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Empty State (Chef-Themed)
                  <div className="text-center py-12">
                    <FireIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" /> {/* Empty stove/pan vibe */}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {activeTab === 'today' ? "No KOTs Today" : "No KOTs in the Kitchen"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {search || statusFilter !== 'all'
                        ? 'Try adjusting your search or filter to see orders.'
                        : activeTab === 'today'
                          ? "No kitchen orders for today yet. Check back soon!"
                          : "No pending orders. The kitchen is ready for the next rush!"
                      }
                    </p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('all');
                        updateCurrentPage(1);
                      }}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center p-4 border-t bg-gray-50 space-x-2">
                  <button
                    onClick={() => updateCurrentPage(Math.max(currentTabPage - 1, 1))}
                    disabled={currentTabPage === 1}
                    className="px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => updateCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${currentTabPage === page
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => updateCurrentPage(Math.min(currentTabPage + 1, totalPages))}
                    disabled={currentTabPage === totalPages}
                    className="px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
