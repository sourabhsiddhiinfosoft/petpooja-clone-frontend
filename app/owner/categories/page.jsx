"use client";
import DashboardLayout from "../../../components/DashboardLayout";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "../../../store/api/ownerApi";
import { ModalBox } from "../../../components/ModalBox";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";
import { TableLoading } from "../../../components/Loading/tableLoading";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCurrentBranch } from "../../../store/hooks/useCurrentBranch";
import { default as Select, components } from "react-select";
import { darkStyles } from "../../../styles/darkmodeSelect";

export default function OwnerCategories() {

  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || "";
  const branchId = currentBranch?._id || "";
  const { data = [], isLoading, isError } = useGetCategoriesQuery(`${restaurantId}?branchId=${branchId}`, { skip: !restaurantId });

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
    branchIds: [],
    type: "single",
  });


  const itemsPerPage = 5;

  // Filter categories
  const filteredData = useMemo(() => {
    return data.filter((cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // Prepare options for React Select
  const branchOptions = useMemo(() => {
    return branches.map((branch) => ({
      value: branch._id,
      label: `${branch.name} - ${branch.address?.city || 'N/A'} (${branch.status})`,
    }));
  }, [branches]);


  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpen = (type, category) => {
    if (type === "add") {
      setNewCategory({
        name: "",
        description: "",
        imageUrl: "",
        restaurantId: restaurantId,
        branchIds: branchId ? [branchId] : [],  // Pre-select current branch as array
        type: "single"
      });
    } else {
      setSelectedCategory(category ? { ...category, branchIds: category.branchIds || [] } : null);  // Ensure branchIds is array
    }
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedCategory(null);
    setModalType(null);
    setNewCategory({
      name: "",
      description: "",
      imageUrl: "",
      branchIds: [],
      type: "single",
      restaurantId: restaurantId,
    });
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
      const updatedCategory = {
        ...selectedCategory,
        branchIds: selectedCategory.type === "all" ? [] : (selectedCategory.branchIds || []),  // Ensure array, empty for all
      };
      await updateCategory(updatedCategory).unwrap();
      toast.success("Category updated successfully.");
    } catch (error) {
      toast.error("Failed to update category.");
    }
  };


  // ✅ Updated handleCreate
  const handleCreate = async () => {
    try {
      const categoryToCreate = {
        ...newCategory,
        branchIds: newCategory.type === "all" ? [] : (newCategory.branchIds || []),  // Ensure array, empty for all
      };
      console.log("Create category =>", categoryToCreate);

      await createCategory(categoryToCreate).unwrap();
      toast.success("Category added successfully.");
    } catch (error) {
      toast.error("Failed to add category.");
    }
  };



  const handleConfirm = async () => {
    const currentForm = modalType === "add" ? newCategory : selectedCategory;
    const currentType = currentForm.type || "single";
    const currentBranchIds = currentForm.branchIds || [];



    if (modalType === "delete") {
      if (selectedCategory && selectedCategory._id) {
        await handleDelete(selectedCategory._id);
      }
    }
    // Validation: Ensure branches selected for single/multiple
    if ((currentType === "single" || currentType === "multiple") && currentBranchIds.length === 0) {
      toast.error("Please select at least one branch.");
      return;
    }
    else if (modalType === "edit") {
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
      let updated = { ...newCategory, [field]: value };

      // Special handling for type change
      if (field === "type") {
        if (value === "all") {
          updated.branchIds = [];  // Empty for all
        } else if (value === "single" && newCategory.branchIds.length > 1) {
          updated.branchIds = [newCategory.branchIds[0] || branchId];  // Keep first or current
        }
      }

      setNewCategory(updated);
    } else {
      let updated = { ...selectedCategory, [field]: value };

      // Special handling for type change in edit
      if (field === "type") {
        if (value === "all") {
          updated.branchIds = [];  // Empty for all
        } else if (value === "single" && selectedCategory.branchIds.length > 1) {
          updated.branchIds = [selectedCategory.branchIds[0]];  // Keep first
        }
      }

      setSelectedCategory(updated);
    }
  };


  // Handle branch selection with React Select (works for both add/edit)
  const handleBranchChange = (selectedOptions, actionMeta) => {
    const isAddMode = modalType === "add";
    const currentForm = isAddMode ? newCategory : selectedCategory;
    const currentType = currentForm.type || "single";

    let newBranchIds;
    if (currentType === "single") {
      // Single: take first option or empty
      newBranchIds = selectedOptions ? [selectedOptions.value] : [];
    } else if (currentType === "multiple") {
      // Multi: array of values
      newBranchIds = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
    } else {
      // All: empty array
      newBranchIds = [];
    }

    if (isAddMode) {
      setNewCategory((prev) => ({ ...prev, branchIds: newBranchIds }));
    } else {
      setSelectedCategory((prev) => ({ ...prev, branchIds: newBranchIds }));
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
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
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
                    value={modalType === "add" ? newCategory.name : selectedCategory.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Name"
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    value={modalType === "add" ? newCategory.description : selectedCategory.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Description"
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Apply To</label>
                  <select
                    value={newCategory.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="single">Single Branch</option>
                    <option value="multiple">Multiple Branches</option>
                    <option value="all">All Branches</option>
                  </select>
                </div>

                {/* Show branch selector if not "all" */}
                {((modalType === "add" ? newCategory.type : selectedCategory?.type) !== "all") && (
                  <div>
                    <label className="block mb-1 font-medium">
                      Select Branch{((modalType === "add" ? newCategory.type : selectedCategory?.type) === "multiple") ? "es" : ""}
                    </label>
                    <Select
                      isMulti={((modalType === "add" ? newCategory.type : selectedCategory?.type) === "multiple")}
                      options={branchOptions}
                      value={
                        ((modalType === "add" ? newCategory.branchIds : selectedCategory?.branchIds) || []).map((id) =>
                          branchOptions.find((opt) => opt.value === id)
                        )
                      }
                      onChange={handleBranchChange}
                      placeholder={
                        ((modalType === "add" ? newCategory.type : selectedCategory?.type) === "single")
                          ? "Select a branch"
                          : "Select branches (search and click to add)"
                      }
                      className="basic-single"
                      classNamePrefix="select"
                      isSearchable={true}
                      isClearable={true}
                      isDisabled={!branches || branches.length === 0}
                      styles={darkStyles}
                    />
                    {((modalType === "add" ? newCategory.branchIds : selectedCategory?.branchIds) || []).length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">No branch{((modalType === "add" ? newCategory.type : selectedCategory?.type) === "multiple") ? "es" : ""} selected</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block mb-1 font-medium">Image URL</label>
                  <input
                    type="url"
                    value={modalType === "add" ? newCategory.imageUrl : selectedCategory.imageUrl}
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
