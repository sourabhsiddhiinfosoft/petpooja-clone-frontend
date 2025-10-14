"use client";
import { useState } from 'react';
import DashboardLayout from "../../../components/DashboardLayout";
import { useCurrentBranch } from "../../../store/hooks/useCurrentBranch";
import toast from 'react-hot-toast';
import { 
  ChevronLeftIcon, 
  UserGroupIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useGetRunningTablesQuery } from '../../../store/api/staffApi';

export default function RunningTablesPage() {
  const { user } = useCurrentBranch();
//   const restaurantId = user?.restaurantId || '';
//   const branchId = user?.branchId || '';

const q = `${user?._id}` || '';

  const { data: runningTablesData, isLoading, isError } = useGetRunningTablesQuery(q,{skip: !user?._id});

  const [selectedTable, setSelectedTable] = useState(null);
  const [search, setSearch] = useState(''); // Optional search by table name
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust for grid

  // Extract data (assumes response structure from backend)
  const runningTables = runningTablesData?.data || [];
  const totalTables = runningTablesData?.totalTables || 0;

  // Filter by search (client-side; optional)
  const filteredTables = runningTables
    .flatMap(area => area.tables) // Flatten if grouped by area
    .filter(table => 
      table.name.toLowerCase().includes(search.toLowerCase()) ||
      (table.area?.name || '').toLowerCase().includes(search.toLowerCase())
    );

  // Pagination (flatten for simple list; group if needed)
  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const paginatedTables = filteredTables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle table selection (integrate with your order flow)
  const handleTableSelect = (table) => {
    setSelectedTable(table);
    // Example: nextStep() or router.push(`/staff/order-flow?tableId=${table._id}`);
    toast.success(`Selected Table: ${table.name}`);
    console.log('Selected table:', table); // Customize action (e.g., open order modal)
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      'out-of-service': 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (isError) {
    toast.error('Failed to load running tables');
  }

  return (
    <DashboardLayout userType="waiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                My Running Tables
              </h1>
              <p className="text-gray-600">View and manage tables assigned to you ({totalTables} active)</p>
            </div>
            {/* Optional Search */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search tables by name or area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Loading your running tables...</p>
            </div>
          )}

          {isError && (
            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">Failed to load running tables. Please refresh.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* Results Summary */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {paginatedTables.length} of {filteredTables.length} running tables
                  {search && ` • Search: "${search}"`}
                </p>
              </div>

              {/* Grouped by Area (if data has areas) or Flat Grid */}
              {runningTables.length > 0 && runningTables[0]?.tables ? (
                // Grouped by Area
                runningTables.map((area) => (
                  <div key={area._id} className="border-b border-gray-100 last:border-b-0">
                    <div className="p-4 bg-blue-50 border-b border-blue-100">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5 text-blue-600" />
                        {area.name} ({area.tables?.length || 0} tables)
                      </h2>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {area.tables
                          .filter(table => 
                            table.name.toLowerCase().includes(search.toLowerCase()) ||
                            area.name.toLowerCase().includes(search.toLowerCase())
                          )
                          .map((table) => (
                            <button
                              key={table._id}
                              onClick={() => handleTableSelect(table)}
                              className={`p-4 rounded-lg border-2 transition-all group hover:shadow-md ${
                                selectedTable?._id === table._id
                                  ? 'border-blue-500 bg-blue-50 shadow-md'
                                  : table.status === 'occupied'
                                  ? 'border-red-500 bg-red-50 hover:border-red-400'
                                  : table.status === 'reserved'
                                  ? 'border-yellow-500 bg-yellow-50 hover:border-yellow-400'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="text-center">
                                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${
                                  table.status === 'occupied' ? 'bg-red-500' :
                                  table.status === 'reserved' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}>
                                  <span className="text-white font-bold text-sm">{table.name}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">{table.name}</p>
                                <p className="text-xs text-gray-500 mb-2">{table.seats} seats</p>
                                <StatusBadge status={table.status} />
                                {table.currentOrder && (
                                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                    <p className="font-medium text-blue-600">Order Active</p>
                                    <p className="text-gray-600">Status: {table.currentOrder.status}</p>
                                    <p className="text-gray-600">Total: ₹{table.currentOrder.total?.toFixed(2)}</p>
                                  </div>
                                )}
                                {table.orderBy && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Assigned: {table.orderBy.name}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Flat Grid (if not grouped)
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {paginatedTables.map((table) => (
                      <button
                        key={table._id}
                        onClick={() => handleTableSelect(table)}
                        className={`p-4 rounded-lg border-2 transition-all group hover:shadow-md ${
                          selectedTable?._id === table._id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : table.status === 'occupied'
                            ? 'border-red-500 bg-red-50 hover:border-red-400'
                            : table.status === 'reserved'
                            ? 'border-yellow-500 bg-yellow-50 hover:border-yellow-400'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors ${
                            table.status === 'occupied' ? 'bg-red-500' :
                            table.status === 'reserved' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            <span className="text-white font-bold text-sm">{table.name}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{table.name}</p>
                          <p className="text-xs text-gray-500 mb-2">{table.seats} seats</p>
                          <StatusBadge status={table.status} />
                          {table.currentOrder && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                              <p className="font-medium text-blue-600">Order Active</p>
                              <p className="text-gray-600">Status: {table.currentOrder.status}</p>
                              <p className="text-gray-600">Total: ₹{table.currentOrder.total?.toFixed(2)}</p>
                            </div>
                          )}
                          {table.orderBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Assigned: {table.orderBy.name}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Pagination (if flat list) */}
              {totalPages > 1 && !runningTables[0]?.tables && (
                <div className="flex justify-center items-center p-4 border-t bg-gray-50 space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center gap-1"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white border border-gray-300 hover:bg-gray-50 hover:border-blue-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-gray-50 transition flex items-center gap-1"
                  >
                    Next
                    <ChevronLeftIcon className="h-4 w-4 rotate-180" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State (if no tables) */}
          {!isLoading && !isError && filteredTables.length === 0 && (
            <div className="p-12 text-center">
              <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Running Tables</h3>
              <p className="text-gray-500 mb-4">
                {search 
                  ? 'No tables match your search. Try a different keyword.' 
                  : 'No tables are currently assigned to you or running. Check back later or contact the manager.'
                }
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
