"use client";
import toast from 'react-hot-toast';
import DashboardLayout from '../../../components/DashboardLayout';
import { useDeleteOwnerMutation, useGetOwnersQuery, useUpdateOwnerMutation, useCreateOwnerMutation, useGetRestaurantsQuery } from '../../../store/api/adminApi';
import { ModalBox } from '../../../components/ModalBox';
import { useMemo, useState } from 'react';
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AdminOwners() {
  const { data = [], isLoading, isError } = useGetOwnersQuery();
  const { data:restaurants, isLoading:restaurantsLoading, isError:restaurantError } = useGetRestaurantsQuery();
  const [updateOwner] = useUpdateOwnerMutation();
  const [deleteOwner] = useDeleteOwnerMutation();
  const [createOwner] = useCreateOwnerMutation();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [newOwner, setNewOwner] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    restaurantId:""
  });

  const itemsPerPage = 5;

  // Filter Owners
  const filteredData = useMemo(() => {
    return data.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpen = (type, Owner) => {
    setSelectedOwner(Owner ? { ...Owner } : null);
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedOwner(null);
    setModalType(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteOwner(id).unwrap();
      toast.success("Owner deleted successfully.");
    } catch (error) {
      console.error("Failed to delete the Owner: ", error);
      toast.error("Failed to delete the Owner.");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateOwner(selectedOwner).unwrap();
      toast.success("Owner updated successfully.");
    } catch (error) {
      console.error("Failed to update the Owner: ", error);
      toast.error("Failed to update the Owner.");
    }
  };

  const handleCreate = async () => {
    try {
      await createOwner(newOwner).unwrap();
      toast.success("Owner created successfully.");
    } catch (error) {
      console.error("Failed to create the Owner: ", error);
      toast.error("Failed to create the Owner.");
    }
  };

  const handleConfirm = async () => {
    if (modalType === "delete") {
      if (selectedOwner && selectedOwner._id) {
        await handleDelete(selectedOwner._id);
      }
    } else if (modalType === "edit") {
      if (selectedOwner && selectedOwner._id) {
        await handleUpdate();
      }
    } else if (modalType === "add") {
      await handleCreate();
    }
    handleClose();
  };

  // Handle input changes for edit form
  const handleInputChange = (field, value) => {
    setSelectedOwner((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header + Search */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Owners</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by owner name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => {
                setNewOwner({ name: "", email: "", phone: "", password: "" });
                setModalType("add");
              }}
            >
              + Add Owner
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {isLoading && <p className="text-gray-500 p-6">Loading...</p>}
          {isError && (
            <p className="text-red-600 p-6">Failed to load Owners.</p>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Created date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((r, idx) => (
                    <tr
                      key={r._id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3">{r.email}</td>
                      <td className="p-3">{new Date(r.createdAt).toLocaleDateString("en-GB", {day: "2-digit",month: "2-digit",year: "numeric",})}</td>
                      <td className="p-3 flex gap-3">
                        <button
                          title="Edit"
                          className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          onClick={() => handleOpen("edit", r)}
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-label="Edit data" />
                        </button>
                        <button
                          title="View"
                          className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => handleOpen("view", r)}
                        >
                          <EyeIcon className="h-4 w-4 text-black" aria-label='View data'/>
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={() => handleOpen("delete", r)}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                )
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        <ModalBox
          active={!!modalType}
          title={
            modalType === "view"
              ? "View Owner"
              : modalType === "edit"
              ? "Edit Owner"
              : modalType === "add"
              ? "Add Owner"
              : "Delete Owner"
          }
          onClose={handleClose}
          onConfirm={modalType === "delete" ? handleConfirm : null}
          confirmText={modalType === "delete" ? "Delete" : modalType === "add" ? "Add" : "Save"}
          showFooter={modalType === "delete"}
        >
          {modalType === "view" && selectedOwner && (
            <div>
              <p>
                <b>Name:</b> {selectedOwner?.name || "N/A"}
              </p>
              <p>
                <b>Email:</b> {selectedOwner?.email || "N/A"}
              </p>
            </div>
          )}

          {modalType === "edit" && selectedOwner && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleUpdate();
                handleClose();
              }}
            >
              <input
                type="text"
                value={selectedOwner.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Name"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                type="email"
                value={selectedOwner.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Email"
                className="border rounded px-3 py-2 w-full"
                readOnly
              />
              <input
                type="tel"
                value={selectedOwner.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Phone"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
              >
                Save
              </button>
            </form>
          )}

          {modalType === "delete" && selectedOwner && (
            <p>
              Are you sure you want to delete <b>{selectedOwner.name}</b>?
            </p>
          )}

          {modalType === "add" && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleCreate();
                handleClose();
              }}
            >
              <input
                type="text"
                value={newOwner.name}
                onChange={(e) => setNewOwner((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Name"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                type="email"
                value={newOwner.email}
                onChange={(e) => setNewOwner((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                type="tel"
                value={newOwner.phone}
                onChange={(e) => setNewOwner((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                type="password"
                value={newOwner.password}
                onChange={(e) => setNewOwner((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <select
                value={newOwner.restaurantId}
                onChange={(e) => setNewOwner((prev) => ({ ...prev, restaurantId: e.target.value }))}
                 className="w-full text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Restaurant</option>
                {restaurants &&
                  restaurants.map((rest) => (
                    <option key={rest._id} value={rest._id}>
                      {rest.name}
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
              >
                Add
              </button>
            </form>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}


