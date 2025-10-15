"use client"
import { useMemo, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { TableLoading } from "../../../components/Loading/tableLoading";

import { PencilSquareIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCreateOrderMutation, useGetOrdersQuery, useUpdateOrderStatusMutation } from "../../../store/api/ownerApi";
import { ModalBox } from "../../../components/ModalBox";
import Link from "next/link";

export default function OwnerOrders() {
  const [search, setSearch] = useState("");
  const { data: ordersData, isLoading, isError, refetch } = useGetOrdersQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [modalType, setModalType] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    restaurantId: "",
    tableId: "",
    customer: { name: "", phone: "" },
    type: "dine-in",
    items: [
      { menuItem: "", qty: 1, addons: [], notes: "" }
    ],
    paymentMethod: "cash",
  });

  // Mutations
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  // Filter and paginate orders (same as before)
  const filteredData = useMemo(() => {
    if (!ordersData) return [];
    return ordersData.filter(
      (order) =>
        order._id.toLowerCase().includes(search.toLowerCase()) ||
        order.tableId?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, ordersData]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open modal and initialize form data
  const handleOpen = (type, order = null) => {
    setModalType(type);
    setSelectedOrder(order);
    if (type === "edit" && order) {
      // Map order data to formData shape
      setFormData({
        restaurantId: order.restaurantId || "",
        tableId: order.tableId?._id || "",
        customer: {
          name: order.customer?.name || "",
          phone: order.customer?.phone || "",
        },
        type: order.type || "dine-in",
        items: order.items?.map((item) => ({
          menuItem: item.menuItem || "",
          qty: item.qty || 1,
          addons: item.addons || [],
          notes: item.notes || "",
        })) || [{ menuItem: "", qty: 1, addons: [], notes: "" }],
        paymentMethod: order.paymentMethod || "cash",
      });
    } else if (type === "add") {
      // Reset form for add
      setFormData({
        restaurantId: "",
        tableId: "",
        customer: { name: "", phone: "" },
        type: "dine-in",
        items: [{ menuItem: "", qty: 1, addons: [], notes: "" }],
        paymentMethod: "cash",
      });
    }
  };

  const handleClose = () => {
    setModalType(null);
    setSelectedOrder(null);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested customer input changes
  const handleCustomerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));
  };

  // Handle items array changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Add new item row
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { menuItem: "", qty: 1, addons: [], notes: "" }],
    }));
  };

  // Remove item row
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: newItems.length ? newItems : [{ menuItem: "", qty: 1, addons: [], notes: "" }],
    }));
  };

  // Submit handler for add order
  const handleAddOrder = async (e) => {
    e.preventDefault();
    try {
      await createOrder(formData).unwrap();
      handleClose();
      refetch();
    } catch (error) {
      console.error("Failed to create order", error);
    }
  };

  // Submit handler for edit order (only status update here, extend as needed)
  const handleEditOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await updateOrderStatus({ id: selectedOrder._id, status: formData.status }).unwrap();
      handleClose();
      refetch();
    } catch (error) {
      console.error("Failed to update order", error);
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

              <Link
              href={"/owner/createOrder"}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                // onClick={() => handleOpen('add')}
              >
                + Add Order
              </Link>
            </div>
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
                    className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                      disabled={true}
                        title="Edit"
                        className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      onClick={() => handleOpen("edit", cat)}
                      >
                        <PencilSquareIcon className="h-4 w-4" aria-label="Edit data" />
                      </button>
                      <button
                        title="View"
                        className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                      onClick={() => handleOpen("view", cat)}
                      >
                        <EyeIcon className="h-4 w-4 text-black" aria-label='View data' />
                      </button>
                      <button
                        title="Delete"
                        className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => handleOpen("delete", cat)}
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
                className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

         {/* Modal */}
     <ModalBox
          active={!!modalType}
          title={modalType === 'view'? 'View Order': modalType === 'edit'? 'Edit Order': modalType === 'add'? 'Add Order': 'Delete Order'}
          onClose={handleClose}
          onConfirm={modalType === 'delete' ? handleConfirm : null}
          confirmText={modalType === 'delete'? 'Delete': modalType === 'add'? 'Add': 'Save'}
          showFooter={modalType === 'delete'}
        >
            {modalType === "view" && selectedOrder && (
              <div>
                <h2 className="text-xl font-bold mb-4">Order Details</h2>
                <p><b>Order ID:</b> {selectedOrder._id}</p>
                <p><b>Table:</b> {selectedOrder.tableId?.name || "N/A"}</p>
                <p><b>Type:</b> {selectedOrder.type}</p>
                <p><b>Status:</b> {selectedOrder.status}</p>
                <p><b>Customer:</b> {selectedOrder.customer?.name} ({selectedOrder.customer?.phone})</p>
                <p><b>Payment Method:</b> {selectedOrder.paymentMethod}</p>
                <h3 className="mt-4 font-semibold">Items:</h3>
                <ul className="list-disc pl-5">
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.name || item.menuItem} - Qty: {item.qty} - Price: ${item.price?.toFixed(2) || "N/A"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(modalType === "add" || modalType === "edit") && (
              <form
                onSubmit={modalType === "add" ? handleAddOrder : handleEditOrder}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold mb-4">
                  {modalType === "add" ? "Add New Order" : "Edit Order"}
                </h2>

                {/* Restaurant ID */}
                <div>
                  <label className="block mb-1 font-medium">Restaurant ID</label>
                  <input
                    type="text"
                    value={formData.restaurantId}
                    onChange={(e) => handleInputChange("restaurantId", e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                    disabled={modalType === "edit"} // Usually restaurantId is fixed on edit
                  />
                </div>

                {/* Table ID */}
                <div>
                  <label className="block mb-1 font-medium">Table ID</label>
                  <input
                    type="text"
                    value={formData.tableId}
                    onChange={(e) => handleInputChange("tableId", e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>

                {/* Customer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Customer Name</label>
                    <input
                      type="text"
                      value={formData.customer.name}
                      onChange={(e) => handleCustomerChange("name", e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Customer Phone</label>
                    <input
                      type="tel"
                      value={formData.customer.phone}
                      onChange={(e) => handleCustomerChange("phone", e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block mb-1 font-medium">Order Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                  >
                    <option value="dine-in">Dine-in</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                {/* Items */}
                <div>
                  <label className="block mb-1 font-medium">Items</label>
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="border rounded p-3 mb-3 space-y-2">
                      <div className="grid grid-cols-4 gap-4">
                        <input
                          type="text"
                          placeholder="Menu Item ID"
                          value={item.menuItem}
                          onChange={(e) => handleItemChange(idx, "menuItem", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                          required
                        />
                        <input
                          type="number"
                          min={1}
                          placeholder="Quantity"
                          value={item.qty}
                          onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                          className="border rounded px-2 py-1 w-full"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Addons (comma separated)"
                          value={item.addons.join(", ")}
                          onChange={(e) =>
                            handleItemChange(
                              idx,
                              "addons",
                              e.target.value.split(",").map((a) => a.trim()).filter(Boolean)
                            )
                          }
                          className="border rounded px-2 py-1 w-full"
                        />
                        <input
                          type="text"
                          placeholder="Notes"
                          value={item.notes}
                          onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-600 hover:underline text-sm"
                        disabled={formData.items.length === 1}
                      >
                        Remove Item
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block mb-1 font-medium">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
                >
                  {modalType === "add" ? (isCreating ? "Adding..." : "Add Order") : (isUpdating ? "Saving..." : "Save Changes")}
                </button>
              </form>
            )}
              {modalType === 'delete' && selectedItem && (
            <p>
              Are you sure you want to delete <b>{selectedItem.name}</b>?
            </p>
          )}
            </ModalBox>
        
      </div>
    </DashboardLayout>
  );
}


