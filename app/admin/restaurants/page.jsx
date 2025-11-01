"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import Image from "next/image";

export default function AdminRestaurants() {
  const router = useRouter();
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
      router.push("/admin/restaurants/add");
      return;
    }
    if (type === "edit" && restaurant?._id) {
      router.push(`/admin/restaurants/${restaurant._id}/edit`);
      return;
    }
    setSelectedRestaurant(restaurant ? { ...restaurant } : null);
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
                    {/* <th className="p-3 text-left">Logo</th> */}
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
                      {/* <td className="p-3">
                        <Image
                          src={r.logo || "/images/No-Image-Placeholder.png"}
                          alt={r.name}
                          className="w-10 h-10 rounded-md object-cover shadow-sm"
                          // error={() => "/images/No-Image-Placeholder.png"}
                          width={40}
                          height={40}
                        />
                      </td> */}
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
              : modalType === "delete"
                ? "Delete Restaurant"
                : ""
          }
          onClose={handleClose}
          onConfirm={modalType === "delete" ? handleConfirm : null}
          confirmText={modalType === "delete" ? "Delete" : undefined}
          size={"md"}
        >
          {modalType === "view" && selectedRestaurant && (
            <div>
              {/* <p>
                <img src={selectedRestaurant.logo || "/images/No-image-Placeholder.png"} alt={selectedRestaurant.name} className="w-20 h-20 rounded-md object-cover shadow-sm" />
              </p> */}
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
                <b>Phone:</b> {selectedRestaurant?.phone || selectedRestaurant?.owner?.phone || "N/A"}
              </p>
              {/* Add more fields as needed */}
            </div>
          )}

          {/* Edit/Add moved to dedicated pages */}

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