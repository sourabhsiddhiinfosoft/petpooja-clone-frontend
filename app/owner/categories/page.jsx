"use client";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  useAddCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../../store/api/ownerApi";
import { ModalBox } from "../../../components/ModalBox";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { TableLoading } from "../../../components/Loading/tableLoading";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function OwnerCategories() {
  const { data = [], isLoading, isError } = useGetCategoriesQuery();
  const [createCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  const itemsPerPage = 5;

  // Filter categories
  const filteredData = useMemo(() => {
    return data.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpen = (type, category) => {
    if (type === "add") {
      setNewCategory({ name: "", description: "", imageUrl: "" });
    } else {
      setSelectedCategory(category ? { ...category } : null);
    }
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setModalType(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id).unwrap();
      toast.success("Category deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete category.");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateCategory(selectedCategory).unwrap();
      toast.success("Category updated successfully.");
    } catch (error) {
      toast.error("Failed to update category.");
    }
  };

  const handleCreate = async () => {
    try {
      await createCategory(newCategory).unwrap();
      toast.success("Category added successfully.");
    } catch (error) {
      toast.error("Failed to add category.");
    }
  };

  const handleConfirm = async () => {
    if (modalType === "delete") {
      if (selectedCategory && selectedCategory._id) {
        await handleDelete(selectedCategory._id);
      }
    } else if (modalType === "edit") {
      if (selectedCategory && selectedCategory._id) {
        await handleUpdate();
      }
    } else if (modalType === "add") {
      await handleCreate();
    }
    handleClose();
  };

  const handleInputChange = (field, value) => {
    if (modalType === "add") {
      setNewCategory((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setSelectedCategory((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Create, update, delete and view categories</p>
          </div>
            {/* Search */}
       <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by category name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            onClick={() => handleOpen("add")}
          >
            + Add Category
          </button>
        </div>
        </div>

      

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && <TableLoading />}
          {isError && <p className="text-red-600 p-6">Failed to load categories.</p>}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Image</th>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Description</th>
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
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-12 h-12 object-cover rounded-md border"
                        />
                      </td>
                      <td className="p-3 font-medium">{cat.name}</td>
                      <td className="p-3">{cat.description}</td>
                      <td className="p-3 flex gap-3">
                        <button
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
                          <EyeIcon className="h-4 w-4 text-black" aria-label='View data'/>
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
              ? "View Category"
              : modalType === "edit"
              ? "Edit Category"
              : modalType === "add"
              ? "Add Category"
              : "Delete Category"
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
          {modalType === "view" && selectedCategory && (
            <div>
              <p>
                <b>Name:</b> {selectedCategory?.name || "N/A"}
              </p>
              <p>
                <b>Description:</b> {selectedCategory?.description || "N/A"}
              </p>
              <p>
                <b>Image:</b>{" "}
                <img
                  src={selectedCategory?.imageUrl}
                  alt={selectedCategory?.name}
                  className="w-24 h-24 rounded-md border mt-2"
                />
              </p>
            </div>
          )}

          {(modalType === "edit" || modalType === "add") &&
            (selectedCategory || modalType === "add") && (
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleConfirm();
                }}
              >
                <div>
                  <label className="block mb-1 font-medium">Category Name</label>
                  <input
                    type="text"
                    value={
                      modalType === "add"
                        ? newCategory.name
                        : selectedCategory.name
                    }
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Name"
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    value={
                      modalType === "add"
                        ? newCategory.description
                        : selectedCategory.description
                    }
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Description"
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Image URL</label>
                  <input
                    type="url"
                    value={
                      modalType === "add"
                        ? newCategory.imageUrl
                        : selectedCategory.imageUrl
                    }
                    onChange={(e) =>
                      handleInputChange("imageUrl", e.target.value)
                    }
                    placeholder="https://example.com/category.jpg"
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
                >
                  {modalType === "add" ? "Add" : "Save"}
                </button>
              </form>
            )}

          {modalType === "delete" && selectedCategory && (
            <p>
              Are you sure you want to delete <b>{selectedCategory.name}</b>?
            </p>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}
