"use client";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  useAddStaffMutation,
  useGetStaffQuery,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
} from "../../../store/api/ownerApi";
import { ModalBox } from "../../../components/ModalBox";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { TableLoading } from "../../../components/Loading/tableLoading";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCurrentBranch } from "../../../store/hooks/useCurrentBranch";
import Select from 'react-select'; // For branch selection

export default function OwnerStaff() {
  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || "";
  const branchId = currentBranch?._id || "";

  // Query with restaurantId filter
  const { data = [], isLoading, isError } = useGetStaffQuery(restaurantId, { skip: !restaurantId });
  const [createStaff] = useAddStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [newStaff, setNewStaff] = useState({
    restaurantId: restaurantId,
    branchId: branchId,
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "waiter", // Default role
    isActive: true,
  });

  const itemsPerPage = 5;

  // Branch options for React Select
  const branchOptions = useMemo(() => {
    return branches.map((branch) => ({
      value: branch._id,
      label: `${branch.name} - ${branch.address?.city || 'N/A'}`,
    }));
  }, [branches]);

  // Dark mode styles for React Select
  const darkStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#374151' : '#1f2937',
      borderColor: state.isFocused ? '#4f46e5' : '#4b5563',
      color: '#f9fafb',
      boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none',
      '&:hover': { borderColor: '#6b7280' },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1f2937',
      borderColor: '#4b5563',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#374151' : '#1f2937',
      color: state.isSelected ? '#ffffff' : '#f9fafb',
      '&:hover': { backgroundColor: '#374151' },
    }),
    placeholder: (provided) => ({ ...provided, color: '#9ca3af' }),
    input: (provided) => ({ ...provided, color: '#f9fafb' }),
    singleValue: (provided) => ({ ...provided, color: '#f9fafb' }),
  };

  // Get current form values (unified for add/edit)
  const getFormValue = (field) => {
    return modalType === 'add' ? newStaff[field] : selectedStaff?.[field] || '';
  };

  // Get current branch option
  const getCurrentBranchOption = () => {
    const currentBranchId = getFormValue('branchId');
    return branchOptions.find((opt) => opt.value === currentBranchId) || null;
  };

  // Filter staff (now includes role in search)
  const filteredData = useMemo(() => {
    return data.filter((staff) =>
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.role.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpen = (type, staff) => {
    if (type === "add") {
      setNewStaff({
        restaurantId: restaurantId,
        branchId: branchId, // Pre-select current branch
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "waiter", // Default role
        isActive: true,
      });
    } else {
      setSelectedStaff(staff ? { 
        ...staff, 
        branchId: staff.branchId || branchId, // Ensure branchId
        role: staff.role || 'waiter',
        isActive: staff.isActive !== undefined ? staff.isActive : true,
      } : null);
    }
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedStaff(null);
    setModalType(null);
    // Reset newStaff
    setNewStaff({
      restaurantId: restaurantId,
      branchId: branchId,
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "waiter",
      isActive: true,
    });
  };

  // Handle branch change (unified for add/edit)
  const handleBranchChange = (selectedOption) => {
    const branchId = selectedOption ? selectedOption.value : branchId;
    if (modalType === 'add') {
      setNewStaff((prev) => ({ ...prev, branchId }));
    } else {
      setSelectedStaff((prev) => ({ ...prev, branchId }));
    }
  };

  const handleInputChange = (field, value) => {
    if (modalType === "add") {
      setNewStaff((prev) => ({ ...prev, [field]: value }));
    } else if (modalType === "edit") {
      setSelectedStaff((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteStaff(id).unwrap();
      toast.success("Staff deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete staff.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedStaff?._id) return;
    try {
      const updatePayload = {
        id: selectedStaff._id,
        restaurantId,
        branchId: selectedStaff.branchId,
        name: selectedStaff.name,
        phone: selectedStaff.phone,
        role: selectedStaff.role,
        isActive: selectedStaff.isActive,
        // Email/password not updated (as per security)
      };
      await updateStaff(updatePayload).unwrap();
      toast.success("Staff updated successfully.");
    } catch (error) {
      toast.error("Failed to update staff.");
    }
  };

  const handleCreate = async () => {
    try {
      const createPayload = {
        ...newStaff,
        restaurantId,
        // Password optional; if empty, backend handles
      };
      await createStaff(createPayload).unwrap();
      toast.success("Staff added successfully.");
    } catch (error) {
      toast.error("Failed to add staff.");
    }
  };

  const handleConfirm = async () => {
    // Basic validation
    if ((modalType === 'add' || modalType === 'edit') && !getFormValue('branchId')) {
      toast.error('Please select a branch.');
      return;
    }
    if ((modalType === 'add' || modalType === 'edit') && !getFormValue('role')) {
      toast.error('Please select a role.');
      return;
    }

    if (modalType === "delete") {
      if (selectedStaff && selectedStaff._id) {
        await handleDelete(selectedStaff._id);
      }
    } else if (modalType === "edit") {
      if (selectedStaff && selectedStaff._id) {
        await handleUpdate();
      }
    } else if (modalType === "add") {
      await handleCreate();
    }
    handleClose();
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
              <p className="text-gray-600">Create, update, delete and view staff accounts</p>
            </div>
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by staff name or role"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => handleOpen("add")}
              >
                + Add Staff
              </button>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && <TableLoading />}
          {isError && <p className="text-red-600 p-6">Failed to load staff.</p>}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Branch</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((staff, idx) => (
                    <tr
                      key={staff._id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="p-3 font-medium">{staff.name}</td>
                      <td className="p-3">{staff.email || "N/A"}</td>
                      <td className="p-3">{staff.phone || "N/A"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          staff.role === 'waiter' ? 'bg-blue-100 text-blue-800' :
                          staff.role === 'chef' ? 'bg-green-100 text-green-800' :
                          staff.role === 'cashier' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {staff.role}
                        </span>
                      </td>
                      <td className="p-3">{staff.branch?.name || "N/A"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          staff.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {staff.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 flex gap-3">
                        <button
                          title="Edit"
                          className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          onClick={() => handleOpen("edit", staff)}
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-label="Edit Staff" />
                        </button>
                        <button
                          title="View"
                          className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => handleOpen("view", staff)}
                        >
                          <EyeIcon className="h-4 w-4 text-black" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={() => handleOpen("delete", staff)}
                        >
                          <TrashIcon className="h-4 w-4" aria-label="Delete staff" />
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

        {/* Modal */}
        <ModalBox
          active={!!modalType}
          title={
            modalType === "view"
              ? "View Staff"
              : modalType === "edit"
              ? "Edit Staff"
              : modalType === "add"
              ? "Add Staff"
              : "Delete Staff"
          }
          onClose={handleClose}
          onConfirm={modalType === "delete" ? handleConfirm : null}
          confirmText={
            modalType === "delete"
              ? "Delete"
              : modalType === "add"
              ? "Add"
              : "Save"
          }
          showFooter={modalType === "delete"}
        >
          {modalType === "view" && selectedStaff && (
            <div className="space-y-3">
              <p><b>Name:</b> {selectedStaff?.name || "N/A"}</p>
              <p><b>Email:</b> {selectedStaff?.email || "N/A"}</p>
              <p><b>Phone:</b> {selectedStaff?.phone || "N/A"}</p>
              <p><b>Role:</b> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                  selectedStaff.role === 'waiter' ? 'bg-blue-100 text-blue-800' :
                  selectedStaff.role === 'chef' ? 'bg-green-100 text-green-800' :
                  selectedStaff.role === 'cashier' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {selectedStaff.role}
                </span>
              </p>
              <p><b>Branch:</b> {selectedStaff.branch?.name || "N/A"}</p>
              <p><b>Status:</b> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedStaff.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {selectedStaff.isActive ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          )}

          {(modalType === "edit" || modalType === "add") && (selectedStaff || modalType === "add") && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleConfirm();
              }}
            >
              {/* Branch Select */}
              <div className="mb-3">
                <label className="block mb-1 font-medium">Branch</label>
                <Select
                  options={branchOptions}
                  value={getCurrentBranchOption()}
                  onChange={handleBranchChange}
                  placeholder="Select a branch"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={false} // Required
                  isDisabled={!branches || branches.length === 0}
                  styles={darkStyles}
                />
              </div>

              {/* Name Input */}
              <div className="mb-3">
                <label className="block mb-1 font-medium">Staff Name</label>
                <input
                  type="text"
                  value={getFormValue('name')}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter staff name"
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Email Input (Add only, optional) */}
              {modalType === "add" && (
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Email (Optional)</label>
                  <input
                    type="email"
                    value={getFormValue('email')}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="staff@example.com"
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Password Input (Add only, optional) */}
              {modalType === "add" && (
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Password (Optional)</label>
                  <input
                    type="password" // Use type="password" for security
                    value={getFormValue('password')}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password"
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Phone Input */}
              <div className="mb-3">
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="tel"
                  value={getFormValue('phone')}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number (e.g., 9876543210)"
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Role Select */}
              <div className="mb-3">
                <label className="block mb-1 font-medium">Role</label>
                <select
                  value={getFormValue('role')}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="waiter">Waiter</option>
                  <option value="chef">Chef</option>
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {/* Status Checkbox (Edit only) */}
              {modalType === "edit" && (
                <div className="mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={getFormValue('isActive')}
                      onChange={(e) => handleInputChange("isActive", e.target.checked)}
                      className="rounded"
                    />
                    Active
                  </label>
                </div>
              )}

              {/* Non-Editable Email in Edit */}
              {modalType === "edit" && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500">
                    <b>Email:</b> {selectedStaff?.email || "N/A"} (Not editable)
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full mt-4"
              >
                {modalType === "add" ? "Add Staff" : "Save Changes"}
              </button>
            </form>
          )}

          {modalType === "delete" && selectedStaff && (
            <p className="text-gray-700">
              Are you sure you want to delete <b>{selectedStaff.name}</b> ({selectedStaff.role})? This action cannot be undone.
            </p>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}
