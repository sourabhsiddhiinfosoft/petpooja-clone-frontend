"use client";
import { useMemo, useState } from "react";
import { ModalBox } from "../../../components/ModalBox";
import {
  useDeleteRestaurantMutation,
  useGetRestaurantsQuery,
  useUpdateRestaurantMutation,
  useCreateRestaurantMutation,
} from "../../../store/api/adminApi";
import DashboardLayout from "../../../components/DashboardLayout";
import toast from "react-hot-toast";
import { TableLoading } from "../../../components/Loading/tableLoading";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function AdminRestaurants() {
  const { data = [], isLoading, isError } = useGetRestaurantsQuery();
  const [updateRestaurant] = useUpdateRestaurantMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();
  const [createRestaurant] = useCreateRestaurantMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [modalType, setModalType] = useState(null);

  const itemsPerPage = 5;

  // Filter restaurants
  const filteredData = useMemo(() => {
    return data.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.city.toLowerCase().includes(search.toLowerCase()) ||
        r.owner?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpen = (type, restaurant) => {
    if (type === "add") {
      setSelectedRestaurant({
        name: "",
        slug: "",
        city: "",
        state: "",
        country: "",
        address: "",
        cuisineType: "",
        logo: "",
        description: "",
        GSTIN: "",
        FSSAI: "",
        isActive: true,
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        ownerPassword: "",
      });
    } else {
      setSelectedRestaurant(restaurant ? { ...restaurant } : null);
    }
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedRestaurant(null);
    setModalType(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRestaurant(id).unwrap();
      toast.success("Restaurant deleted successfully.");
    } catch (error) {
      console.error("Failed to delete the restaurant: ", error);
      toast.error("Failed to delete the restaurant.");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateRestaurant(selectedRestaurant).unwrap();
      toast.success("Restaurant updated successfully.");
    } catch (error) {
      console.error("Failed to update the restaurant: ", error);
      toast.error("Failed to update the restaurant.");
    }
  };

  const handleAdd = async () => {
    try {
      // Remove empty fields if needed
      const payload = { ...selectedRestaurant };
      await createRestaurant(payload).unwrap();
      toast.success("Restaurant added successfully.");
    } catch (error) {
      console.error("Failed to add the restaurant: ", error);
      toast.error("Failed to add the restaurant.");
    }
  };

  const handleConfirm = async () => {
    if (modalType === "delete") {
      if (selectedRestaurant && selectedRestaurant._id) {
        await handleDelete(selectedRestaurant._id);
      }
    } else if (modalType === "edit") {
      if (selectedRestaurant && selectedRestaurant._id) {
        await handleUpdate();
      }
    } else if (modalType === "add") {
      await handleAdd();
    }
    handleClose();
  };

  // Handle input changes for edit/add form
  const handleInputChange = (field, value) => {
    setSelectedRestaurant((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Header + Search + Add Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Restaurants</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name, city, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => handleOpen("add")}
            >
              + Add Restaurant
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {isLoading && <TableLoading />}
          {isError && (
            <p className="text-red-600 p-6">Failed to load restaurants.</p>
          )}

          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Logo</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">City</th>
                    <th className="p-3 text-left">Cuisine</th>
                    <th className="p-3 text-left">Owner</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((r, idx) => (
                    <tr
                      key={r._id}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition`}
                    >
                      <td className="p-3">
                        <img
                          src={r.logo}
                          alt={r.name}
                          className="w-10 h-10 rounded-md object-cover shadow-sm"
                        />
                      </td>
                      <td className="p-3 font-medium">{r.name}</td>
                      <td className="p-3">{r.city}</td>
                      <td className="p-3">{r.cuisineType}</td>
                      <td className="p-3">{r.owner?.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${r.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                            }`}
                        >
                          {r.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
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
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === page
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
              ? "View Restaurant"
              : modalType === "edit"
                ? "Edit Restaurant"
                : modalType === "add"
                  ? "Add Restaurant"
                  : "Delete Restaurant"
          }
          onClose={handleClose}
          onConfirm={modalType !== "view" ? handleConfirm : null}
          confirmText={
            modalType === "delete"
              ? "Delete"
              : modalType === "add"
                ? "Add"
                : "Save"
          }
          size={modalType === ("add" || "edit") ? "3xl" : "md"}
        >
          {modalType === "view" && selectedRestaurant && (
            <div>
              <p>
                <img src={selectedRestaurant.logo} alt={selectedRestaurant.name} className="w-20 h-20 rounded-md object-cover shadow-sm" />
              </p>
              <p>
                <b>Name:</b> {selectedRestaurant?.name || "N/A"}
              </p>
              <p>
                <b>City:</b> {selectedRestaurant?.city || "N/A"}
              </p>
              <p>
                <b>Owner:</b> {selectedRestaurant.owner?.name || "N/A"}
              </p>
              <p>
                <b>Description:</b> {selectedRestaurant?.description || "N/A"}
              </p>
              <p>
                <b>Cuisine Type:</b> {selectedRestaurant?.cuisineType || "N/A"}
              </p>
              <p>
                <b>Status:</b>{" "}
                {selectedRestaurant.isActive ? "Active" : "Inactive"}
              </p>
              <p>
                <b>Address:</b> {selectedRestaurant?.address || "N/A"}
              </p>
              <p>
                <b>Phone:</b> {selectedRestaurant?.phone || "N/A"}
              </p>
              {/* Add more fields as needed */}
            </div>
          )}

          {(modalType === "edit" || modalType === "add") && selectedRestaurant && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={selectedRestaurant.isActive || false}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                />
                Active
              </label>
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex flex-col gap-3">
                  {/* Row 1 */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={selectedRestaurant.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Name"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                      required
                    />
                    <input
                      type="text"
                      value={selectedRestaurant.slug || ""}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      placeholder="Slug"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                      required
                    />
                  </div>
                  {/* Row 2 */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={selectedRestaurant.city || ""}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="City"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                      required
                    />
                    <input
                      type="text"
                      value={selectedRestaurant.state || ""}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="State"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                      required
                    />
                  </div>
                  {/* Row 3 */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={selectedRestaurant.country || ""}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      placeholder="Country"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                      required
                    />
                    <input
                      type="text"
                      value={selectedRestaurant.address || ""}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Address"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                      required
                    />
                  </div>
                  {/* Row 4 */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={selectedRestaurant.cuisineType || ""}
                      onChange={(e) =>
                        handleInputChange("cuisineType", e.target.value)
                      }
                      placeholder="Cuisine Type"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                      required
                    />
                    <input
                      type="text"
                      value={selectedRestaurant.logo || ""}
                      onChange={(e) => handleInputChange("logo", e.target.value)}
                      placeholder="Logo URL"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                    />
                  </div>
                  {/* Row 5 */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={selectedRestaurant.GSTIN || ""}
                      onChange={(e) => handleInputChange("GSTIN", e.target.value)}
                      placeholder="GSTIN"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                    />
                    <input
                      type="text"
                      value={selectedRestaurant.FSSAI || ""}
                      onChange={(e) => handleInputChange("FSSAI", e.target.value)}
                      placeholder="FSSAI"
                      className="border rounded px-3 py-2 w-full md:w-1/2"
                    />
                  </div>
                  {/* Owner fields only for add */}
                  {modalType === "add" && (
                    <>
                      <div className="flex flex-col md:flex-row gap-3">
                        <input
                          type="text"
                          value={selectedRestaurant?.ownerName || ""}
                          onChange={(e) =>
                            handleInputChange("ownerName", e.target.value)
                          }
                          placeholder="Owner Name"
                          className="border rounded px-3 py-2 w-full md:w-1/2"
                          required
                        />
                        <input
                          type="tel"
                          value={selectedRestaurant.ownerPhone || ""}
                          onChange={(e) =>
                            handleInputChange("ownerPhone", e.target.value)
                          }
                          placeholder="Owner Phone"
                          className="border rounded px-3 py-2 w-full md:w-1/2"
                          required
                        />
                      </div>
                      <div className="flex flex-col md:flex-row gap-3">
                        <input
                          type="email"
                          value={selectedRestaurant.ownerEmail || ""}
                          onChange={(e) =>
                            handleInputChange("ownerEmail", e.target.value)
                          }
                          placeholder="Owner Email"
                          className="border rounded px-3 py-2 w-full md:w-1/2"
                          required
                        />
                        <div className="relative w-full md:w-1/2">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={selectedRestaurant.ownerPassword || ""}
                            onChange={(e) =>
                              handleInputChange("ownerPassword", e.target.value)
                            }
                            placeholder="Owner Password"
                            className="border rounded px-3 py-2 w-full pr-10"
                            required={modalType === "add"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              // Eye-off icon
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              // Eye icon
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Description full width */}
                  <textarea
                    value={selectedRestaurant.description || ""}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Description"
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
              {/* Hidden submit button to allow form submission on Enter */}
              <button type="submit" className="hidden">
                {modalType === "add" ? "Add" : "Save"}
              </button>
            </form>
          )}

          {modalType === "delete" && selectedRestaurant && (
            <p>
              Are you sure you want to delete <b>{selectedRestaurant.name}</b>?
            </p>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}