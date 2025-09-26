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

export default function OwnerMenuItems() {
  const { data = [], isLoading, isError } = useGetMenuQuery();
   const { data:categories } = useGetCategoriesQuery();

  const [createMenuItem] = useAddMenuItemMutation();
  const [updateMenuItem] = useUpdateMenuItemMutation();
  const [deleteMenuItem] = useDeleteMenuItemMutation();

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    isAvailable: true,
  });

  const itemsPerPage = 5;

  // Filter menu items
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpen = (type, item) => {
    if (type === 'add') {
      setNewItem({
        name: '',
        category: '',
        price: '',
        description: '',
        isAvailable: true,
      });
    } else {
      setSelectedItem(item ? { ...item } : null);
    }
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id).unwrap();
      toast.success('Menu item deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete menu item.');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMenuItem(selectedItem).unwrap();
      toast.success('Menu item updated successfully.');
    } catch (error) {
      toast.error('Failed to update menu item.');
    }
  };

  const handleCreate = async () => {
    try {
      await createMenuItem(newItem).unwrap();
      toast.success('Menu item added successfully.');
    } catch (error) {
      toast.error('Failed to add menu item.');
    }
  };

  const handleConfirm = async () => {
    if (modalType === 'delete') {
      if (selectedItem && selectedItem._id) {
        await handleDelete(selectedItem._id);
      }
    } else if (modalType === 'edit') {
      if (selectedItem && selectedItem._id) {
        await handleUpdate();
      }
    } else if (modalType === 'add') {
      await handleCreate();
    }
    handleClose();
  };

  // Handle input changes for edit/add form
  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      setNewItem((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setSelectedItem((prev) => ({
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
                    <th className="p-3 text-left">Availablity</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => (
                    <tr
                      key={item._id}
                      className={`${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 transition`}
                    >
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item?.categoryId?.name}</td>
                      <td className="p-3">₹{item.price}</td>
                      <td className="p-3">
                        {item.isAvailable ? (
                          <span className="text-green-600 font-semibold">Available</span>
                        ) : (
                          <span className="text-gray-400">Unavailable</span>
                        )}
                      </td>
                      <td className="p-3">{item?.tags && String(item?.tags)}</td>
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
                          <EyeIcon className="h-4 w-4 text-black" aria-label='View data'/>
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
          title={
            modalType === 'view'
              ? 'View Menu Item'
              : modalType === 'edit'
              ? 'Edit Menu Item'
              : modalType === 'add'
              ? 'Add Menu Item'
              : 'Delete Menu Item'
          }
          onClose={handleClose}
          onConfirm={modalType === 'delete' ? handleConfirm : null}
          confirmText={
            modalType === 'delete'
              ? 'Delete'
              : modalType === 'add'
              ? 'Add'
              : 'Save'
          }
          showFooter={modalType === 'delete'}
        >
          {modalType === 'view' && selectedItem && (
            <div>
              <p>
                <b>Name:</b> {selectedItem?.name || 'N/A'}
              </p>
              <p>
                <b>Category:</b> {selectedItem?.category || 'N/A'}
              </p>
              <p>
                <b>Price:</b> ₹{selectedItem?.price || 'N/A'}
              </p>
              <p>
                <b>Description:</b> {selectedItem?.description || 'N/A'}
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
                value={modalType === 'add' ? newItem.name : selectedItem.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Name"
                className="border rounded px-3 py-2 w-full"
                required
              />
              </div>
              <hr className="my-2" />
                <div className='mb-2'>
                <label className="block mb-1 font-medium">Menu Item Category</label>
                <select
                  value={modalType === 'add' ? newItem.category : selectedItem?.categoryId?._id}
                  onChange={(e) => setNewTable((prev) => ({ ...prev, category: e.target.value }))}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                >
                  <option value="">Select Area</option>
                  {categories && categories.length &&
                    categories?.map((cat) => (
                      <option key={`cato-${cat?._id}`} value={cat?._id}>
                        {cat?.name}
                      </option>
                    ))}
                </select>
              <p className="text-sm text-blue-500 mt-1"> <Link href="/owner/categories" >Add Categories</Link></p>
              </div>
              <hr className="my-2" />
              <div className='mb-2'>
                <label className="block mb-1 font-medium">Price (₹)</label>
              <input
                type="number"
                value={modalType === 'add' ? newItem.price : selectedItem.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Price"
                className="border rounded px-3 py-2 w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                required
                min="0"
                step="0.01"
                
              />
              </div>
              <hr className="my-2" />
              
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                value={modalType === 'add' ? newItem.description : selectedItem.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description"
                className="border rounded px-3 py-2 w-full"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={modalType === 'add' ? newItem.isAvailable : selectedItem.isAvailable}
                  onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
                />
                Active
              </label>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
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


