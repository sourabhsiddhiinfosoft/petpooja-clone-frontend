"use client";
import React, { useMemo, useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { TableLoading } from "../../../components/Loading/tableLoading";
import { useNotifications } from "../../../contexts/NotificationContext";

import { PencilSquareIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useGetDiscountsQuery, useAddDiscountMutation, useUpdateDiscountMutation, useDeleteDiscountMutation } from "../../../store/api/ownerApi";
import { ModalBox } from "../../../components/ModalBox";
import { formatDateToDDMMYY } from "../../../lib/dateConvertion";
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import { useGetCategoriesQuery, useGetMenuQuery } from '../../../store/api/ownerApi';
import toast from 'react-hot-toast';
import { selectOptionStyles } from "../../../lib/helpers";

export default function DiscountsManagement() {
  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || '';
  const branchId = currentBranch?._id || '';
  const q1 = `${restaurantId}?branchId=${branchId}`
  const q = `restaurantId=${restaurantId}&branchId=${branchId}`

  // API Hooks
  const { data: discounts = [], isLoading,isError, refetch } = useGetDiscountsQuery(branchId, { skip: !branchId });

  const { data: categories = [] } = useGetCategoriesQuery(q1, { skip: !branchId });
  const { data: menuItems = [] } = useGetMenuQuery(q, { skip: !branchId });

  const [addDiscount] = useAddDiscountMutation();
  const [updateDiscount] = useUpdateDiscountMutation();
  const [deleteDiscount] = useDeleteDiscountMutation();

  const { addNotificationHandler } = useNotifications();

  // Handle real-time notifications if needed (e.g., for discount updates)
  useEffect(() => {
    const unsubscribe = addNotificationHandler((notification) => {
      if (notification.type === 'discount_updated') {
        refetch();
      }
    });
    return unsubscribe;
  }, [addNotificationHandler, refetch]);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal state
  const [modalType, setModalType] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountType: 'percentage',
    value: 0,
    minOrderAmount: 0,
    applicableCategories: [],
    applicableItems: [],
    branchId: branchId,
    startDate: null,
    endDate: null,
    isActive: true,
    autoApply: false,
  });

  // Accordion state
  const [expandedDiscountId, setExpandedDiscountId] = useState(null);

  // Filter and paginate discounts
  const filteredData = useMemo(() => {
    if (!discounts) return [];
    return discounts.filter(
      (discount) =>
        discount.name.toLowerCase().includes(search.toLowerCase()) ||
        discount.discountType.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, discounts]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle accordion
  const toggleAccordion = (discountId) => {
    setExpandedDiscountId(expandedDiscountId === discountId ? null : discountId);
  };

  // Open modal and initialize form data
  const handleOpen = (type, discount = null) => {
    setModalType(type);
    setSelectedDiscount(discount);
    if (type === "edit" && discount) {
      setFormData({
        ...discount,
        applicableCategories: discount.applicableCategories?.map(id => ({ value: id, label: categories.find(c => c._id === id)?.name })) || [],
        applicableItems: discount.applicableItems?.map(id => ({ value: id, label: menuItems.find(i => i._id === id)?.name })) || [],
        startDate: discount.startDate ? new Date(discount.startDate) : null,
        endDate: discount.endDate ? new Date(discount.endDate) : null,
      });
    } else if (type === "add") {
      setFormData({
        name: '',
        description: '',
        discountType: 'percentage',
        value: 0,
        minOrderAmount: 0,
        applicableCategories: [],
        applicableItems: [],
        branchId: branchId,
        startDate: null,
        endDate: null,
        isActive: true,
        autoApply: false,
      });
    }
  };

  const handleClose = () => {
    setModalType(null);
    setSelectedDiscount(null);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit handler for add/edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      applicableCategories: formData.applicableCategories.map(c => c.value),
      applicableItems: formData.applicableItems.map(i => i.value),
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    };

    try {
      if (modalType === "edit" && selectedDiscount) {
        await updateDiscount({ id: selectedDiscount._id, ...payload });
        toast.success('Discount updated successfully');
      } else {
        await addDiscount(payload);
        toast.success('Discount added successfully');
      }
      handleClose();
      refetch();
    } catch (error) {
      toast.error(error.message || 'Failed to save discount');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDiscount) return;
    try {
      await deleteDiscount(selectedDiscount._id);
      toast.success('Discount deleted successfully');
      handleClose();
      refetch();
    } catch (error) {
      toast.error('Failed to delete discount');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (discount) => {
    try {
      await updateDiscount({ id: discount._id, isActive: !discount.isActive });
      toast.success(`Discount ${!discount.isActive ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discounts Management</h1>
              <p className="text-gray-600">Manage discounts for your restaurant</p>
            </div>
            <div className='flex gap-4'>
              <input
                type="text"
                placeholder="Search by name or type"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={() => handleOpen('add')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Add Discount
              </button>
            </div>
          </div>
        </div>

        {isLoading && <TableLoading />}
        {isError && <div className="text-red-500">Failed to load discounts. Please try again.</div>}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-800 sticky top-0">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Min Order</th>
                  <th className="p-3 text-left">Active</th>
                  <th className="p-3 text-left">Validity</th>
                  <th className="p-3 text-left">Details</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((discount, idx) => (
                  <React.Fragment key={discount._id}>
                    <tr
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition cursor-pointer`}
                      onClick={() => toggleAccordion(discount._id)}
                    >
                      <td className="p-3">{discount.name}</td>
                      <td className="p-3 capitalize">{discount.discountType}</td>
                      <td className="p-3">{discount.discountType === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}</td>
                      <td className="p-3">₹{discount.minOrderAmount}</td>
                      <td className="p-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleActive(discount); }}
                          className={`px-2 py-1 rounded ${discount.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-3">
                        {discount.startDate ? formatDateToDDMMYY(new Date(discount.startDate)) : 'N/A'} - {discount.endDate ? formatDateToDDMMYY(new Date(discount.endDate)) : 'N/A'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleAccordion(discount._id); }}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          View Details
                          {expandedDiscountId === discount._id ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 flex gap-3">
                        <button
                          title="Edit"
                          className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          onClick={(e) => { e.stopPropagation(); handleOpen("edit", discount); }}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          title="View"
                          className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={(e) => { e.stopPropagation(); handleOpen("view", discount); }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={(e) => { e.stopPropagation(); handleOpen("delete", discount); }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {/* Accordion Content */}
                    {expandedDiscountId === discount._id && (
                      <tr>
                        <td colSpan="8" className="bg-gray-50 border-t border-gray-200">
                          <div className="p-4">
                            <h4 className="font-semibold mb-2">Discount Details:</h4>
                            <p><strong>Description:</strong> {discount.description || 'N/A'}</p>
                            <p><strong>Applicable Categories:</strong> {discount.applicableCategories?.length ? categories.filter(c => discount.applicableCategories.includes(c._id)).map(c => c.name).join(', ') : 'All'}</p>
                            <p><strong>Applicable Items:</strong> {discount.applicableItems?.length ? menuItems.filter(i => discount.applicableItems.includes(i._id)).map(i => i.name).join(', ') : 'All'}</p>
                            <p><strong>Auto Apply:</strong> {discount.autoApply ? 'Yes' : 'No'}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
              {paginatedData.length === 0 && (
                <tbody>
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No discounts found.
                    </td>
                  </tr>
                </tbody>
              )}
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
          title={modalType === 'view' ? 'View Discount' : modalType === 'edit' ? 'Edit Discount' : modalType === 'add' ? 'Add Discount' : 'Delete Discount'}
          onClose={handleClose}
          onConfirm={modalType === 'delete' ? handleDelete : null}
          confirmText={modalType === 'delete' ? 'Delete' : modalType === 'add' ? 'Add' : 'Save'}
          showFooter={modalType === 'delete'}
        >
          {modalType === "view" && selectedDiscount && (
            <div>
              <h2 className="text-xl font-bold mb-4">Discount Details</h2>
              <p><b>Name:</b> {selectedDiscount.name}</p>
              <p><b>Description:</b> {selectedDiscount.description || 'N/A'}</p>
              <p><b>Type:</b> {selectedDiscount.discountType}</p>
              <p><b>Value:</b> {selectedDiscount.discountType === 'percentage' ? `${selectedDiscount.value}%` : `₹${selectedDiscount.value}`}</p>
              <p><b>Min Order Amount:</b> ₹{selectedDiscount.minOrderAmount}</p>
              <p><b>Active:</b> {selectedDiscount.isActive ? 'Yes' : 'No'}</p>
              <p><b>Auto Apply:</b> {selectedDiscount.autoApply ? 'Yes' : 'No'}</p>
              <p><b>Validity:</b> {selectedDiscount.startDate ? formatDateToDDMMYY(new Date(selectedDiscount.startDate)) : 'N/A'} - {selectedDiscount.endDate ? formatDateToDDMMYY(new Date(selectedDiscount.endDate)) : 'N/A'}</p>
            </div>
          )}

       {(modalType === "add" || modalType === "edit") && (
  <form onSubmit={handleSubmit} className="space-y-6">
    <h2 className="text-xl font-bold mb-4">
      {modalType === "add" ? "Add New Discount" : "Edit Discount"}
    </h2>

    {/* Name and Discount Type */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Discount Type</label>
        <select
          value={formData.discountType}
          onChange={(e) => handleInputChange("discountType", e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
           <option value="percentage" class="dark:bg-gray-700 dark:text-gray-200">Percentage</option>
  <option value="fixed" class="dark:bg-gray-700 dark:text-gray-200">Fixed</option>
        </select>
        
      </div>
    </div>

    {/* Description */}
    <div>
      <label className="block mb-1 font-medium">Description</label>
      <textarea
        value={formData.description}
        onChange={(e) => handleInputChange("description", e.target.value)}
        className="border rounded px-3 py-2 w-full"
        rows={3}
      />
    </div>

    {/* Value and Min Order Amount */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-1 font-medium">Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
        <input
          type="number"
          value={formData.value}
          onChange={(e) => handleInputChange("value", parseFloat(e.target.value))}
          className="border rounded px-3 py-2 w-full"
          min="0"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Min Order Amount (₹)</label>
        <input
          type="number"
          value={formData.minOrderAmount}
          onChange={(e) => handleInputChange("minOrderAmount", parseFloat(e.target.value))}
          className="border rounded px-3 py-2 w-full"
          min="0"
        />
      </div>
    </div>

    {/* Applicable Categories and Items */}
      <div>
        <label className="block mb-1 font-medium">Applicable Categories</label>
        <Select
          isMulti
          options={categories.map(c => ({ value: c._id, label: c.name }))}
          value={formData.applicableCategories}
          onChange={(selected) => handleInputChange("applicableCategories", selected)}
          placeholder="Select categories (leave empty for all)"
          className="w-full"
          styles={selectOptionStyles}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Applicable Items</label>
        <Select
          isMulti
          options={menuItems.map(i => ({ value: i._id, label: i.name }))}
          value={formData.applicableItems}
          onChange={(selected) => handleInputChange("applicableItems", selected)}
          placeholder="Select items (leave empty for all)"
          className="w-full"
          styles={selectOptionStyles}
        />
      </div>

    {/* Branch */}
    {/* <div>
      <label className="block mb-1 font-medium">Branch</label>
      <select
        value={formData.branchId}
        onChange={(e) => handleInputChange("branchId", e.target.value)}
        className="border rounded px-3 py-2 w-full"
      >
        {branches.map(branch => (
          <option key={branch._id} value={branch._id}>{branch.name}</option>
        ))}
      </select>
    </div> */}

    {/* Start Date and End Date */}
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block mb-1 font-medium">Start Date</label>
        <DatePicker
          selected={formData.startDate}
          onChange={(date) => handleInputChange("startDate", date)}
          className="border rounded px-3 py-2 w-full"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select start date"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">End Date</label>
        <DatePicker
          selected={formData.endDate}
          onChange={(date) => handleInputChange("endDate", date)}
          className="border rounded px-3 py-2 w-full"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select end date"
        />
      </div>
    </div>

    {/* Active and Auto Apply */}
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => handleInputChange("isActive", e.target.checked)}
          className="w-4 h-4"
        />
        <label className="ml-2 font-medium">Active</label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.autoApply}
          onChange={(e) => handleInputChange("autoApply", e.target.checked)}
          className="w-4 h-4"
        />
        <label className="ml-2 font-medium">Auto Apply</label>
      </div>
    </div>

    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
    >
      {modalType === "add" ? "Add Discount" : "Save Changes"}
    </button>
  </form>
)}

{modalType === 'delete' && selectedDiscount && (
  <p>
    Are you sure you want to delete <b>{selectedDiscount.name}</b>?
  </p>
)}

</ModalBox>
</div>
</DashboardLayout>
  )
}