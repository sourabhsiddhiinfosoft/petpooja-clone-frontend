"use client"
import { useMemo, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { TableLoading } from '../../../components/Loading/tableLoading';
import { useGetOrdersQuery } from '../../../store/api/staffApi';
import { useMeQuery } from '../../../store/api/authApi';

export default function OwnerOrders() {
    const [search, setSearch] = useState("");
    // const { data: userData } = useMeQuery();
    //   const restaurantId = userData?.restaurantId;
  const { data: ordersData, isLoading, isError } = useGetOrdersQuery();
const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);

     const filteredData = useMemo(() => {
        return ordersData?.filter((cat) =>
          cat?.name?.toLowerCase().includes(search.toLowerCase())
        );
      }, [search, ordersData]);

  const itemsPerPage = 5;

  // Pagination logic
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const paginatedData = filteredData?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">View and update order status</p>
          </div>
          <div className='flex gap-4'>
            <input
              type="text"
              placeholder="Search by order id,name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => handleOpen('add')}
            >
              + Add Order
            </button>
          </div>
        </div>

        {isLoading && <TableLoading />}
        {isError && <div className="text-red-500">Failed to load orders. Please try again.</div>}
        {!isLoading && !isError && (
             <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-700">
                          <thead className="bg-gray-100 text-gray-800 sticky top-0">
                            <tr>
                              <th className="p-3 text-left">Id</th>
                              <th className="p-3 text-left">Table Name</th>
                              <th className="p-3 text-left">Type</th>
                              <th className='p-3 text-left'>Status</th>
                              <th className="p-3 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.map((cat, idx) => (
                              <tr
                                key={cat._id}
                                className={`${
                                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-blue-50 transition`}
                              >
                                <td className="p-3">
                                  {cat._id}
                                </td>
                                <td className="p-3 font-medium">{cat?.tableId?.name}</td>
                                <td className="p-3">{cat?.type}</td>
                                <td className="p-3">{cat?.status}</td>
                                <td className="p-3 flex gap-3">
                                  <button
                                    title="Edit"
                                    className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                    // onClick={() => handleOpen("edit", cat)}
                                  >
                                    <PencilSquareIcon className="h-4 w-4" aria-label="Edit data" />
                                  </button>
                                  <button
                                    title="View"
                                    className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    // onClick={() => handleOpen("view", cat)}
                                  >
                                    <EyeIcon className="h-4 w-4 text-black" aria-label='View data'/>
                                  </button>
                                  <button
                                    title="Delete"
                                    className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                                    // onClick={() => handleOpen("delete", cat)}
                                  >
                                     <TrashIcon className="h-4 w-4" aria-label="Delete data" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
        )}

         {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
      </div>
    </DashboardLayout>
  );
}


