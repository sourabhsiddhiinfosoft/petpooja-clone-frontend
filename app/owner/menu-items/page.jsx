"use client";
import DashboardLayout from '../../../components/DashboardLayout';
import {
  useGetMenuQuery,
  useAddMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetCategoriesQuery,
  useGetInventoryQuery, // New: For inventory data
} from '../../../store/api/ownerApi';
import { ModalBox } from '../../../components/ModalBox';
import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';
import { TableLoading } from '../../../components/Loading/tableLoading';
import Link from 'next/link';
import { EyeIcon, PencilSquareIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import Select from 'react-select';
import { darkStyles } from '../../../styles/darkmodeSelect';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import axios from 'axios';
import { updateMenuImage } from '../../../lib/updateMenu';

export default function OwnerMenuItems() {
  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || "";
  const branchId = currentBranch?._id || "";

  // New: State for selected category tab
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // "" for All

  // Build query params (include categoryId)
  let q = "";
  if (restaurantId) q += `restaurantId=${restaurantId}`;
  if (branchId) q += `${q ? "&" : ""}branchId=${branchId}`;
  if (selectedCategoryId) q += `${q ? "&" : ""}categoryId=${selectedCategoryId}`;

  const { data = [], isLoading, isError, refetch } = useGetMenuQuery(q, { skip: !restaurantId });
  const { data: categories = [] } = useGetCategoriesQuery(`${restaurantId}?branchId=${branchId}`, { skip: !restaurantId });
  const { data: inventoryData = [] } = useGetInventoryQuery(q, { skip: !restaurantId || !branchId }); // New: Fetch inventory

  const [createMenuItem] = useAddMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();
  const [editingImageId, setEditingImageId] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    categoryId: '',
    price: '',
    description: '',
    isAvailable: true,
    type: 'single',
    branchIds: [branchId],
    restaurantId,
    branchId,
    ingredients: [], // New: Array of { inventoryItem: id, qty: number }
  });

  const itemsPerPage = 8; // Adjusted for cards

  // Filter menu items (client-side search)
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.categoryId?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Prepare options for React Select (categories)
  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat._id,
      label: cat.name,
    }));
  }, [categories]);

  // Prepare options for React Select (branches)
  const branchOptions = useMemo(() => {
    return branches.map((branch) => ({
      value: branch._id,
      label: `${branch.name} - ${branch.address?.city || 'N/A'} (${branch.status})`,
    }));
  }, [branches]);

  // New: Prepare options for React Select (inventory)
  const inventoryOptions = useMemo(() => {
    return inventoryData.map((inv) => ({
      value: inv._id,
      label: `${inv.name} (${inv.unit}) - Qty: ${inv.currentQuantity}`,
    }));
  }, [inventoryData]);

  // Updated handleOpen
  const handleOpen = (type, item) => {
    if (type === 'add') {
      setNewItem({
        name: '',
        categoryId: '',
        price: '',
        description: '',
        isAvailable: true,
        type: 'single',
        branchIds: branchId ? [branchId] : [],
        restaurantId,
        branchId,
        imageFile: null,
        previewUrl: '',
        ingredients: [], // New
      });
    } else {
      setSelectedItem(item ? {
        ...item,
        categoryId: item?.categoryId || '',
        branchIds: item.branchIds || [branchId],
        type: item.type || 'single',
        ingredients: item.ingredients || [], // New
      } : null);
    }
    setModalType(type);
  };

  // Updated handleClose
  const handleClose = () => {
    setSelectedItem(null);
    setModalType(null);
    setNewItem({
      name: '',
      categoryId: '',
      price: '',
      description: '',
      isAvailable: true,
      type: 'single',
      branchIds: branchId ? [branchId] : [],
      restaurantId,
      branchId,
      ingredients: [], // New
    });
    setEditingImageId(null);
    setNewImageFile(null);
    setImagePreview(null);
  };

  // Handle category change with React Select
  const handleCategoryChange = (selectedOption) => {
    const categoryId = selectedOption ? selectedOption.value : '';
    if (modalType === 'add') {
      setNewItem((prev) => ({ ...prev, categoryId: categoryId }));
    } else {
      setSelectedItem((prev) => ({ ...prev, categoryId: categoryId }));
    }
  };

  // New: Handle ingredient changes
  const handleIngredientChange = (index, field, value) => {
    if (modalType === 'add') {
      const newIngredients = [...newItem.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      setNewItem((prev) => ({ ...prev, ingredients: newIngredients }));
    } else {
      const newIngredients = [...selectedItem.ingredients];
      newIngredients[index] = { ...newIngredients[index], [field]: value };
      setSelectedItem((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  // New: Add ingredient
  const addIngredient = () => {
    const newIngredient = { inventoryItem: '', qty: 1 };
    if (modalType === 'add') {
      setNewItem((prev) => ({ ...prev, ingredients: [...prev.ingredients, newIngredient] }));
    } else {
      setSelectedItem((prev) => ({ ...prev, ingredients: [...prev.ingredients, newIngredient] }));
    }
  };

  // New: Remove ingredient
  const removeIngredient = (index) => {
    if (modalType === 'add') {
      const newIngredients = newItem.ingredients.filter((_, i) => i !== index);
      setNewItem((prev) => ({ ...prev, ingredients: newIngredients }));
    } else {
      const newIngredients = selectedItem.ingredients.filter((_, i) => i !== index);
      setSelectedItem((prev) => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id).unwrap();
      toast.success('Menu item deleted successfully.');
      handleClose();
    } catch (error) {
      if (error?.status == 400) {
        toast.error(`Failed to delete menu item.  \n ${error?.data ? error?.data?.error : ""}`);
      } else {
        toast.error(`Something went wrong`);
      }
    }
  };

  const updateMenuItemImage = async (id, imageFile) => {
    try {
      await updateMenuImage(id, imageFile);
      toast.success("Menu item image updated successfully.");
      refetch();
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Error updating image.");
    }
  };

  // Updated handleUpdate (include ingredients)
  const handleUpdate = async () => {
    if (!selectedItem?._id) return;
    try {
      const updatedItem = {
        ...selectedItem,
        restaurantId,
        branchId,
        categoryId: selectedItem.categoryId,
        branchIds: selectedItem.type === 'all' ? [] : (selectedItem.branchIds || []),
        ingredients: selectedItem.ingredients || [], // New
      };
      await updateMenuItem(updatedItem).unwrap();
      toast.success('Menu item updated successfully.');
      handleClose();
    } catch (error) {
      if (error?.status == 400) {
        toast.error(`Failed to update menu item.  \n ${error?.data ? error?.data?.error : ""}`);
      } else {
        toast.error(`Something went wrong`);
      }
    }
  };

  // Updated handleCreate (include ingredients)
  const handleCreate = async () => {
    try {
      const itemToCreate = {
        ...newItem,
        restaurantId,
        branchId,
        categoryId: newItem?.categoryId,
        branchIds: newItem.type === 'all' ? [] : (newItem.branchIds || []),
        ingredients: newItem.ingredients || [], // New
      };
      await createMenuItem(itemToCreate).unwrap();
      toast.success('Menu item added successfully.');
      handleClose();
    } catch (error) {
      console.log(error)
      if (error?.status == 400) {
        toast.error(`Failed to add menu item. \n ${error?.data ? error?.data?.error : ""}`);
      } else {
        toast.error(`Something went wrong`);
      }
    }
  };

  // Updated handleConfirm (add ingredient validation)
  const handleConfirm = async () => {
    if (modalType === 'delete') {
      if (selectedItem && selectedItem._id) {
        await handleDelete(selectedItem._id);
        return
      }
    }

    const currentCategory = modalType === 'add' ? newItem?.categoryId : selectedItem?.categoryId;
    if (!currentCategory) {
      toast.error('Please select a category.');
      return;
    }
    const currentType = getFormValue('type');
    const currentBranchIds = getFormValue('branchIds') || [];
    if ((currentType === 'single' || currentType === 'multiple') && currentBranchIds.length === 0) {
      toast.error('Please select at least one branch.');
      return;
    }
    // New: Ingredient validation (optional, but recommended)
    const currentIngredients = getFormValue('ingredients') || [];
    // if (currentIngredients.length === 0) {
    //   toast.error('Please add at least one ingredient.');
    //   return;
    // }
    if (modalType === 'edit') {
      if (selectedItem && selectedItem._id) {
        await handleUpdate();
      }
    } else if (modalType === 'add') {
      await handleCreate();
    }
  };

  // Update handleInputChange
  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      let updated = { ...newItem, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = [];
        } else if (value === 'single' && newItem.branchIds.length > 1) {
          updated.branchIds = [newItem.branchIds[0] || branchId];
        }
      }

      setNewItem(updated);
    } else {
      let updated = { ...selectedItem, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = [];
        } else if (value === 'single' && selectedItem.branchIds.length > 1) {
          updated.branchIds = [selectedItem.branchIds[0]];
        }
      }

      setSelectedItem(updated);
    }
  };

  // Get current form values
  const getFormValue = (field) => {
    return modalType === 'add' ? newItem[field] : selectedItem?.[field] || '';
  };

  // Get current category option
  const getCurrentCategoryOption = () => {
    const currentCategoryId = getFormValue('categoryId');
    return categoryOptions.find((opt) => opt.value === (currentCategoryId?._id || currentCategoryId)) || null;
  };

  // Get current branch options
  const getCurrentBranchOptions = () => {
    const currentBranchIds = getFormValue('branchIds') || [];
    return currentBranchIds.map((id) =>
      branchOptions.find((opt) => opt.value === id)
    ).filter(Boolean);
  };

  // Handle branch change
  const handleBranchChange = (selectedOptions) => {
    let newBranchIds;
    const currentType = getFormValue('type');

    if (currentType === 'single') {
      newBranchIds = selectedOptions ? [selectedOptions.value] : [];
    } else if (currentType === 'multiple') {
      newBranchIds = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
    } else {
      newBranchIds = [];
    }
    if (modalType === 'add') {
      setNewItem((prev) => ({ ...prev, branchIds: newBranchIds }));
    } else {
      setSelectedItem((prev) => ({ ...prev, branchIds: newBranchIds }));
    }
  };

  const handleImageEditOpen = (id) => {
    setEditingImageId(id);
    setImagePreview(null);
    setNewImageFile(null);
    setModalType('editImage');
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 animate-pulse">
      <div className="w-full h-32 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Items</h1>
              <p className="text-gray-600">Create, update, delete and view items by category</p>
            </div>
            <div className='flex gap-4'>
              <input
                type="text"
                placeholder="Search by name or category"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => handleOpen('add')}
              >
                + Add Menu Item
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategoryId === "" ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedCategoryId("")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedCategoryId === cat._id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={() => setSelectedCategoryId(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

             {/* Cards Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          )}
          {isError && <p className="text-red-600">Failed to load menu items.</p>}
          {!isLoading && !isError && (
            <>
              {paginatedData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedData.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition">
                      <div className="relative">
                        <img
                          src={item?.image || '/images/No-Image-Placeholder.png'}
                          alt={`${item?.name}_img`}
                          className="w-full h-32 object-cover rounded mb-4"
                        />
                        <button
                          title="Edit Image"
                          className="absolute top-2 left-2 p-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => handleImageEditOpen(item._id)}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">{item?.categoryId?.name || 'N/A'}</p>
                      <p className="text-lg font-bold text-green-600 mb-2">₹{item.price}</p>
                      <p className={`text-sm font-medium mb-4 ${item.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          title="Edit"
                          className="flex-1 p-2 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          onClick={() => handleOpen('edit', item)}
                        >
                          <PencilSquareIcon className="h-4 w-4 mx-auto" />
                        </button>
                        <button
                          title="View"
                          className="flex-1 p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => handleOpen('view', item)}
                        >
                          <EyeIcon className="h-4 w-4 mx-auto" />
                        </button>
                        <button
                          title="Delete"
                          className="flex-1 p-2 rounded bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={() => handleOpen('delete', item)}
                        >
                          <TrashIcon className="h-4 w-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-12">No menu items found for the selected category.</p>
              )}
            </>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50 mt-2">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border text-gray-700 hover:bg-gray-100'
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
          title={modalType === 'editImage' ? 'Edit Menu Image' : modalType === 'edit' ? 'Edit Menu Item' : modalType === 'add' ? 'Add Menu Item' : 'Delete Menu Item'}
          onClose={handleClose}
          onConfirm={modalType === 'delete' ? handleConfirm : null}
          confirmText={modalType === 'delete' ? 'Delete' : modalType === 'add' ? 'Add' : 'Save'}
          showFooter={modalType === 'delete'}
        >
          {modalType === 'view' && selectedItem && (
            <div>
              <p>
                <b>Name:</b> {selectedItem?.name || 'N/A'}
              </p>
              {selectedItem?.image && (
                <div className="mt-2">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
              <p>
                <b>Category:</b> {selectedItem?.categoryId?.name || 'N/A'}
              </p>
              <p>
                <b>Price:</b> ₹{selectedItem?.price || 'N/A'}
              </p>
              <p>
                <b>Description:</b> {selectedItem?.description || 'N/A'}
              </p>
              <p>
                <b>Apply To:</b> {selectedItem?.type || 'N/A'} | <b>Branches:</b> {selectedItem?.branchIds?.length || 0}
              </p>
              <p>
                <b>Ingredients:</b> {selectedItem?.ingredients?.length || 0} items
              </p>
              <p>
                <b>Status:</b>{' '}
                {selectedItem?.isAvailable ? (
                  <span className="text-green-600 font-semibold">Available</span>
                ) : (
                  <span className="text-gray-400">Unavailable</span>
                )}
              </p>
            </div>
          )}

          {(modalType === 'edit' || modalType === 'add') && (selectedItem || modalType === 'add') && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleConfirm();
              }}
            >
              <div className='mb-2'>
                <label className="block mb-1 font-medium">Menu Item Name</label>
                <input
                  type="text"
                  value={getFormValue('name')}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Name"
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>

              <hr className="my-2" />

              <div className='mb-2'>
                <label className="block mb-1 font-medium">Menu Item Category</label>
                <Select
                  options={categoryOptions}
                  value={getCurrentCategoryOption()}
                  onChange={handleCategoryChange}
                  placeholder="Select a category"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  isDisabled={!categories || categories.length === 0}
                  styles={darkStyles}
                />
                <p className="text-sm text-blue-500 mt-1">
                  <Link href="/owner/categories">Add Category</Link>
                </p>
              </div>

              <hr className="my-2" />

              <div className='mb-2'>
                <label className="block mb-1 font-medium">Price (₹)</label>
                <input
                  type="number"
                  value={getFormValue('price')}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Price"
                  className="border rounded px-3 py-2 w-full"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <hr className="my-2" />

              <div className='mb-2'>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  value={getFormValue('description')}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description"
                  className="border rounded px-3 py-2 w-full"
                  rows={3}
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={getFormValue('isAvailable')}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                />
                Active
              </label>

              <hr className="my-2" />

              {/* Ingredients Section */}
              <div className='mb-2'>
                <label className="block mb-1 font-medium">Ingredients</label>
                {getFormValue('ingredients')?.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2 p-2 border rounded">
                    <Select
                      options={inventoryOptions}
                      value={inventoryOptions.find((opt) => opt.value === ing.inventoryItem) || null}
                      onChange={(selected) => handleIngredientChange(idx, 'inventoryItem', selected?.value || '')}
                      placeholder="Select inventory item"
                      className="flex-1"
                      classNamePrefix="select"
                      isSearchable={true}
                      isClearable={true}
                      styles={darkStyles}
                    />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={ing.qty}
                      onChange={(e) => handleIngredientChange(idx, 'qty', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="border rounded px-2 py-1 w-20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="p-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addIngredient}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Ingredient
                </button>
              </div>

              <hr className="my-2" />

              {/* New: Apply To Type Select */}
              <div className='mb-2'>
                <label className="block mb-1 font-medium">Apply To</label>
                <select
                  value={getFormValue('type')}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="single">Single Branch</option>
                  <option value="multiple">Multiple Branches</option>
                  <option value="all">All Branches</option>
                </select>
              </div>

              {/* New: Branch Selector (conditional on type) */}
              {getFormValue('type') !== 'all' && (
                <div className='mb-2'>
                  <label className="block mb-1 font-medium">
                    Select Branch{getFormValue('type') === 'multiple' ? 'es' : ''}
                  </label>
                  <Select
                    isMulti={getFormValue('type') === 'multiple'}
                    options={branchOptions}
                    value={getCurrentBranchOptions()}
                    onChange={handleBranchChange}
                    placeholder={
                      getFormValue('type') === 'single'
                        ? 'Select a branch'
                        : 'Select branches (search and click to add)'
                    }
                    className="basic-single"
                    classNamePrefix="select"
                    isSearchable={true}
                    isClearable={true}
                    isDisabled={!branches || branches.length === 0}
                    styles={darkStyles}
                  />
                  {(getFormValue('branchIds') || []).length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {getFormValue('type') === 'single' ? 'No branch selected' : 'No branches selected'}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full mt-4"
              >
                {modalType === 'add' ? 'Add' : 'Save'}
              </button>
            </form>
          )}

          {modalType === 'delete' && selectedItem && (
            <p>
              Are you sure you want to delete <b>{selectedItem.name}</b>?
            </p>
          )}

          {modalType === 'editImage' && editingImageId && (
            <div className="space-y-4">
              <p>Select a new image for this menu item (max 100KB).</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const maxSizeKB = 100;
                    const maxSizeBytes = maxSizeKB * 1024;

                    if (file.size > maxSizeBytes) {
                      toast.error(`Image size must be less than ${maxSizeKB} KB`);
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setImagePreview(ev.target.result);
                      setNewImageFile(file);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="border rounded px-3 py-2 w-full"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded border"
                  />
                </div>
              )}
              <button
                onClick={async () => {
                  if (newImageFile) {
                    await updateMenuItemImage(editingImageId, newImageFile);
                    handleClose();
                  } else {
                    toast.error("Please select an image first.");
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Update Image
              </button>
            </div>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}
