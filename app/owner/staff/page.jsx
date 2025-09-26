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

export default function OwnerStaff() {
  const { data = [], isLoading, isError } = useGetStaffQuery();
  const [createStaff] = useAddStaffMutation();
  const [updateStaff] = useUpdateStaffMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const itemsPerPage = 5;

  // Filter staff
  const filteredData = useMemo(() => {
    return data.filter((staff) =>
      staff.name.toLowerCase().includes(search.toLowerCase())
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
      setNewStaff({ name: "", email: "", password: "", phone: "" });
    } else {
      setSelectedStaff(staff ? { ...staff } : null);
    }
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedStaff(null);
    setModalType(null);
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
    try {
      // Only send updatable fields: name, phone, status (email/password not included)
      const updatePayload = {
        name: selectedStaff.name,
        phone: selectedStaff.phone,
        status: selectedStaff.status,
      };
      await updateStaff({ id: selectedStaff._id, ...updatePayload }).unwrap();
      toast.success("Staff updated successfully.");
    } catch (error) {
      toast.error("Failed to update staff.");
    }
  };

  const handleCreate = async () => {
    try {
      await createStaff(newStaff).unwrap();
      toast.success("Staff added successfully.");
    } catch (error) {
      toast.error("Failed to add staff.");
    }
  };

  const handleConfirm = async () => {
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

  const handleInputChange = (field, value) => {
    if (modalType === "add") {
      setNewStaff((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else if (modalType === "edit") {
      setSelectedStaff((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
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
              placeholder="Search by staff name"
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
                    {/* <th className="p-3 text-left">Status</th> */}
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
                      <td className="p-3">{staff.email}</td>
                      <td className="p-3">{staff.phone || "N/A"}</td>
                      {/* <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            staff.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td> */}
                      <td className="p-3 flex gap-3">
                        
                        <button
                          title="Edit"
                          className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          onClick={() => handleOpen("edit", staff)}
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-label="Edit Table" />
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
                          <TrashIcon className="h-4 w-4" aria-label="Delete table" />
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
            <div className="space-y-2">
              <p>
                <b>Name:</b> {selectedStaff?.name || "N/A"}
              </p>
              <p>
                <b>Email:</b> {selectedStaff?.email || "N/A"}
              </p>
              <p>
                <b>Phone:</b> {selectedStaff?.phone || "N/A"}
              </p>
              {/* <p>
                <b>Status:</b>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedStaff.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedStaff.status}
                </span>
              </p> */}
            </div>
          )}

          {(modalType === "edit" || modalType === "add") && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleConfirm();
              }}
            >
              <div>
                <label className="block mb-1 font-medium">Staff Name</label>
                <input
                  type="text"
                  value={
                    modalType === "add"
                      ? newStaff.name
                      : selectedStaff?.name || ""
                  }
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Name"
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>

              {modalType === "add" && (
                <>
                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="staff@example.com"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <input
                      type="text"
                      value={newStaff.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Password"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block mb-1 font-medium">Phone</label>
                <input
                  type="tel"
                  value={
                    modalType === "add"
                      ? newStaff.phone
                      : selectedStaff?.phone || ""
                  }
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="9876543210"
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>

              {/* {modalType === "edit" && (
                <div>
                  <label className="block mb-1 font-medium">Status</label>
                  <select
                    value={selectedStaff?.status || "active"}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )} */}

              {modalType === "edit" && (
                <>
                  <p className="text-sm text-gray-500">
                    <b>Email:</b> {selectedStaff?.email} (Not editable)
                  </p>
                </>
              )}

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
              >
                {modalType === "add" ? "Add" : "Save"}
              </button>
            </form>
          )}

          {modalType === "delete" && selectedStaff && (
            <p>
              Are you sure you want to delete <b>{selectedStaff.name}</b>?
            </p>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}