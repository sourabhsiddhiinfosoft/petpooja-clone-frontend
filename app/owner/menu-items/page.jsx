"use client";
import DashboardLayout from '../../../components/DashboardLayout';
import {
  useGetMenuQuery,
  useAddMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetCategoriesQuery,
} from '../../../store/api/ownerApi';
import { ModalBox } from '../../../components/ModalBox';
import toast from 'react-hot-toast';
import { useMemo, useState } from 'react';
import { TableLoading } from '../../../components/Loading/tableLoading';
import Link from 'next/link';
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import Select from 'react-select'; // Import React Select
import { darkStyles } from '../../../styles/darkmodeSelect';

export default function OwnerMenuItems() {
  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || "";
  const branchId = currentBranch?._id || "";

  // Build query params
  let q = "";
  if (restaurantId) q += `restaurantId=${restaurantId}`;
  if (branchId) q += `${q ? "&" : ""}branchId=${branchId}`;

  const { data = [], isLoading, isError } = useGetMenuQuery(q, { skip: !restaurantId });
  const { data: categories = [] } = useGetCategoriesQuery(`${restaurantId}?branchId=${branchId}`, { skip: !restaurantId });

  const [createMenuItem] = useAddMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();

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
    type: 'single', // New: Apply To type
    branchIds: [branchId], // New: Pre-select current branch as array
    restaurantId,
    branchId,
    // sku:""
  });

  const itemsPerPage = 5;

  // Filter menu items
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

  // Prepare options for React Select (branches) - New
  const branchOptions = useMemo(() => {
    return branches.map((branch) => ({
      value: branch._id,
      label: `${branch.name} - ${branch.address?.city || 'N/A'} (${branch.status})`,
    }));
  }, [branches]);

  // Updated handleOpen (initialize type/branchIds for add/edit)
  const handleOpen = (type, item) => {
    if (type === 'add') {
      setNewItem({
        name: '',
        categoryId: '',
        price: '',
        description: '',
        isAvailable: true,
        type: 'single', // New
        branchIds: branchId ? [branchId] : [], // New: Pre-select current
        restaurantId,
        branchId,
        // sku:""
      });
    } else {
      // For edit: Ensure category/branchIds/type are set
      setSelectedItem(item ? {
        ...item,
        categoryId: item?.categoryId || '',
        branchIds: item.branchIds || [branchId], // New: Ensure array
        type: item.type || 'single', // New
      } : null);
    }
    setModalType(type);
  };

  // Updated handleClose (reset newItem including type/branchIds)
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
      // sku:""
    });
  };


  // Handle category change with React Select (unified for add/edit)
  const handleCategoryChange = (selectedOption) => {
    const categoryId = selectedOption ? selectedOption.value : '';
    if (modalType === 'add') {
      setNewItem((prev) => ({ ...prev, categoryId: categoryId }));
    } else {
      setSelectedItem((prev) => ({ ...prev, categoryId: categoryId }));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id).unwrap();
      toast.success('Menu item deleted successfully.');
      handleClose();
    } catch (error) {
       if(error?.status == 400){
        toast.error(`Failed to delete menu item.  \n ${error?.data ? error?.data?.error : ""}`);
      }else{
        toast.error(`Something went wrong`);
      }
    }
  };

  // Updated handleUpdate (process branchIds and add type)
  const handleUpdate = async () => {
    if (!selectedItem?._id) return;
    try {
      const updatedItem = {
        ...selectedItem,
        restaurantId,
        branchId,
        categoryId: selectedItem.categoryId,
        branchIds: selectedItem.type === 'all' ? [] : (selectedItem.branchIds || []), // New: Process branchIds
      };
      await updateMenuItem(updatedItem).unwrap();
      toast.success('Menu item updated successfully.');
      handleClose();
    } catch (error) {
       if(error?.status == 400){
        toast.error(`Failed to update menu item.  \n ${error?.data ? error?.data?.error : ""}`);
      }else{
        toast.error(`Something went wrong`);
      }
    }
  };

  // Updated handleCreate (process branchIds and add type)
  const handleCreate = async () => {
    try {
      const itemToCreate = {
        ...newItem,
        restaurantId,
        branchId,
        categoryId: newItem?.categoryId,
        branchIds: newItem.type === 'all' ? [] : (newItem.branchIds || []), // New: Process branchIds
      };
      await createMenuItem(itemToCreate).unwrap();
      toast.success('Menu item added successfully.');
      handleClose();
    } catch (error) {
      console.log(error)
      if(error?.status == 400){
        toast.error(`Failed to add menu item. \n ${error?.data ? error?.data?.error : ""}`);
      }else{
        toast.error(`Something went wrong`);
      }
    }
  };

  // Updated handleConfirm (add branch validation)
  const handleConfirm = async () => {
    // Existing category validation

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
    // New: Branch validation
    const currentType = getFormValue('type');
    const currentBranchIds = getFormValue('branchIds') || [];
    if ((currentType === 'single' || currentType === 'multiple') && currentBranchIds.length === 0) {
      toast.error('Please select at least one branch.');
      return;
    }
    // Rest of your existing logic...
     if (modalType === 'edit') {
      if (selectedItem && selectedItem._id) {
        await handleUpdate();
      }
    } else if (modalType === 'add') {
      await handleCreate();
    }
    
  };

  // Update handleInputChange to handle type changes (reset branchIds on type change) - Updated
  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      let updated = { ...newItem, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = []; // Empty for all
        } else if (value === 'single' && newItem.branchIds.length > 1) {
          updated.branchIds = [newItem.branchIds[0] || branchId]; // Keep first or current
        }
      }

      setNewItem(updated);
    } else {
      let updated = { ...selectedItem, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = []; // Empty for all
        } else if (value === 'single' && selectedItem.branchIds.length > 1) {
          updated.branchIds = [selectedItem.branchIds[0]]; // Keep first
        }
      }

      setSelectedItem(updated);
    }
  };

  // Get current form values for display
  const getFormValue = (field) => {
    return modalType === 'add' ? newItem[field] : selectedItem?.[field] || '';
  };

  // Get current category option for React Select
  const getCurrentCategoryOption = () => {
    const currentCategoryId = getFormValue('categoryId');
    return categoryOptions.find((opt) => opt.value === currentCategoryId) || null;
  };

  // Get current branch options for React Select - New
  const getCurrentBranchOptions = () => {
    const currentBranchIds = getFormValue('branchIds') || [];
    return currentBranchIds.map((id) =>
      branchOptions.find((opt) => opt.value === id)
    ).filter(Boolean); // Filter out nulls
  };

  // Handle branch change with React Select (unified for add/edit) - New
  const handleBranchChange = (selectedOptions) => {
    let newBranchIds;
    const currentType = getFormValue('type');

    if (currentType === 'single') {
      newBranchIds = selectedOptions ? [selectedOptions.value] : [];
    } else if (currentType === 'multiple') {
      newBranchIds = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
    } else {
      newBranchIds = []; // All: empty
    }
    if (modalType === 'add') {
      setNewItem((prev) => ({ ...prev, branchIds: newBranchIds }));
    } else {
      setSelectedItem((prev) => ({ ...prev, branchIds: newBranchIds }));
    }
  };

  function getModelTitle(){
    return
  }

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && <TableLoading />}
          {isError && <p className="text-red-600 p-6">Failed to load menu items.</p>}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Availability</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => (
                    <tr
                      key={item._id}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50 transition`}
                    >
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item?.categoryId?.name || 'N/A'}</td>
                      <td className="p-3">₹{item.price}</td>
                      <td className="p-3">
                        {item.isAvailable ? (
                          <span className="text-green-600 font-semibold">Available</span>
                        ) : (
                          <span className="text-gray-400">Unavailable</span>
                        )}
                      </td>
                      <td className="p-3">{item?.tags ? String(item.tags) : 'N/A'}</td>
                      <td className="p-3 flex gap-3">
                        <button
                          title="Edit"
                          className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          onClick={() => handleOpen('edit', item)}
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-label="Edit data" />
                        </button>
                        <button
                          title="View"
                          className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => handleOpen('view', item)}
                        >
                          <EyeIcon className="h-4 w-4 text-black" aria-label='View data' />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={() => handleOpen('delete', item)}
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
                  {!isLoading && paginatedData?.length == 0 && (<div className='h-[200px] flex justify-center items-center w-full p-2 text-neutral-700'><div>Data not availabile</div></div>)}

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
          title={modalType === 'view' ? 'View Menu Item' : modalType === 'edit' ? 'Edit Menu Item' : modalType === 'add' ? 'Add Menu Item' : 'Delete Menu Item'}
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
                <b>Apply To:</b> {selectedItem?.type || 'N/A'} | <b>Branches:</b> {selectedItem?.branchIds?.length || 0} {/* New */}
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

              {/* <div className='mb-2'>
                <label className="block mb-1 font-medium">Menu Item Sku</label>
                <input
                  type="text"
                  value={getFormValue('sku')}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Ex:roti-1 (short-code)"
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <hr className="my-2" /> */}

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
        </ModalBox>


      </div>
    </DashboardLayout>
  );
}


