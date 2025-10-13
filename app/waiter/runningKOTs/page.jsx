"use client";
import { useMemo, useState } from 'react';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import DashboardLayout from '../../../components/DashboardLayout';
import { TableLoading } from '../../../components/Loading/tableLoading';
import toast from 'react-hot-toast';
import { 
    MagnifyingGlassCircleIcon as SearchIcon, 
  FunnelIcon, 
  ClockIcon, 
  PrinterIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { useGetKOTListQuery } from '../../../store/api/staffApi';

export default function OwnerKOTs() {
  const { user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || '';
  const branchId = user?.branchId || ''; // Assuming current branch; adjust if multi-branch filter needed

  // Build query string
  const q = `${restaurantId ? `restaurantId=${restaurantId}` : ''}${branchId ? `&branchId=${branchId}` : ''}`;
  
  const { data: kots = [], isLoading, isError } = useGetKOTListQuery(q, { skip: !restaurantId });
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'preparing', 'ready'
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 6; // Adjust for card grid

  // Filter KOTs (client-side: search + status)
  const filteredKots = useMemo(() => {
    return kots.filter((kot) => {
      const matchesSearch = 
        kot._id.toLowerCase().includes(search.toLowerCase()) || // KOT ID
        (kot.tableNo || '').toLowerCase().includes(search.toLowerCase()) || // Table
        kot.items.some(item => 
          item.name.toLowerCase().includes(search.toLowerCase()) // Item names
        );
      
      const matchesStatus = statusFilter === 'all' || kot.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [kots, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredKots.length / itemsPerPage);
  const paginatedKots = filteredKots.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status badge component (reusable)
  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      preparing: 'bg-blue-100 text-blue-800 border-blue-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
    };
    const icons = {
      pending: <ExclamationTriangleIcon className="h-3 w-3" />,
      preparing: <ClockIcon className="h-3 w-3" />,
      ready: <CheckCircleIcon className="h-3 w-3" />,
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {icons[status] || <ClockIcon className="h-3 w-3" />}
        {status}
      </span>
    );
  };

  // Print KOT handler (demo; integrate with print lib)
  const handlePrintKOT = (kotId) => {
    // Fetch full KOT if needed, or use window.print()
    toast.success(`Printing KOT ${kotId.slice(-6)}`);
    // Example: const printWindow = window.open('/print-kot/' + kotId, '_blank');
  };

  if (isError) {
    toast.error('Failed to load KOTs');
  }

  return (
    <DashboardLayout userType="waiter">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kitchen Order Tickets (KOTs)</h1>
              <p className="text-gray-600">Manage and view pending KOTs for your kitchen</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-64">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by KOT ID, table, or items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
                />
              </div>
              {/* Status Filter */}
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-full md:w-48"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* KOTs Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && <TableLoading columns={3} />} {/* Or custom spinner */}
          
          {isError && (
            <div className="p-6 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">Failed to load KOTs. Please try again.</p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* Results Summary */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {paginatedKots.length} of {filteredKots.length} KOTs
                  {statusFilter !== 'all' && ` • Filtered by: ${statusFilter}`}
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
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
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
                                  <span className="font-medium">x{item.qty}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm italic">No items</p>
                          )}
                        </div>

                        {/* Footer: Total & Time */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4" />
                              <span>{new Date(kot.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Total:</p>
                              <p className="font-bold text-lg text-green-600">₹{kot.total?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                          {/* Action Button */}
                          <button
                            onClick={() => handlePrintKOT(kot._id)}
                            className="mt-3 w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-indigo-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                          >
                            <PrinterIcon className="h-4 w-4" />
                            Print KOT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Empty State
                  <div className="text-center py-12">
                    <PrinterIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No KOTs Found</h3>
                    <p className="text-gray-500 mb-4">
                      {search || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filter.' 
                        : 'No kitchen orders yet. Create an order to generate KOTs.'
                      }
                    </p>
                    <button
                      onClick={() => { setSearch(''); setStatusFilter('all'); setCurrentPage(1); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
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
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-gray-300 hover:bg-gray-50"
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
