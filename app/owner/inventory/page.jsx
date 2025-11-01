"use client";
import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../../components/DashboardLayout';
import { ModalBox } from '../../../components/ModalBox';
import { TableLoading } from '../../../components/Loading/tableLoading';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import {
  useGetInventoryQuery,
  useAddInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} from '../../../store/api/ownerApi';

export default function OwnerInventory() {
  const { currentBranch, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || '';
  const branchId = currentBranch?._id || '';

  // State
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, low-stock, out-of-stock, in-stock
  const [sortBy, setSortBy] = useState('name'); // name, quantity, lastUpdated
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc

  // New inventory item state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: '',
    unit: 'kg',
    currentQuantity: 0,  // Changed from 'quantity'
    minQuantity: 0,      // Changed from 'lowStockThreshold'
    maxQuantity: 1000,
    costPerUnit: 0,
    supplier: '',
    location: '',
    expiryDate: '',
    isActive: true,
    restaurantId,
    branchId,
  });


  const q = `restaurantId=${restaurantId}&branchId=${branchId}`

  // API calls
  const { data: inventoryData = [], isLoading, isError, refetch } = useGetInventoryQuery(q, { skip: !restaurantId || !branchId });
  const [addInventory, { isLoading: isAdding }] = useAddInventoryMutation();
  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();
  const [deleteInventory, { isLoading: isDeleting }] = useDeleteInventoryMutation();

  const itemsPerPage = 10;

  // Filter and sort inventory data
  const filteredAndSortedData = useMemo(() => {
    let filtered = inventoryData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category?.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(search.toLowerCase());

      let matchesStatus = true;
      if (filterStatus === 'low-stock') {
        matchesStatus = item.currentQuantity <= item.minQuantity && item.currentQuantity > 0;
      } else if (filterStatus === 'out-of-stock') {
        matchesStatus = item.currentQuantity === 0;
      } else if (filterStatus === 'in-stock') {
        matchesStatus = item.currentQuantity > item.minQuantity;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'quantity':
          aValue = a.currentQuantity;  // Changed from a.quantity
          bValue = b.currentQuantity;
          break;
        case 'lastUpdated':
          aValue = new Date(a.updatedAt || a.createdAt);
          bValue = new Date(b.updatedAt || b.createdAt);
          break;
        default: // name
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [inventoryData, search, filterStatus, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Status helpers
  const getStockStatus = (item) => {
    if (item.currentQuantity === 0) return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (item.currentQuantity <= item.minQuantity) return { status: 'low-stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getStockStatusIcon = (item) => {
    const stockStatus = getStockStatus(item);
    switch (stockStatus.status) {
      case 'out-of-stock':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'low-stock':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    }
  };

  // Modal handlers
  const handleOpen = (type, item = null) => {
    if (type === 'add') {
      setNewItem({
        name: '',
        description: '',
        category: '',
        unit: 'kg',
        currentQuantity: 0,  // Ensure consistency
        minQuantity: 0,
        maxQuantity: 1000,
        costPerUnit: 0,
        supplier: '',
        location: '',
        expiryDate: '',
        isActive: true,
        restaurantId,
        branchId,
      });

    } else {
      setSelectedItem(item);
    }
    setModalType(type);
  };

  const handleClose = () => {
    setSelectedItem(null);
    setModalType(null);
    setNewItem({
      name: '',
      description: '',
      category: '',
      unit: 'kg',
      currentQuantity: 0,
      minQuantity: 0,
      maxQuantity: 1000,
      costPerUnit: 0,
      supplier: '',
      location: '',
      expiryDate: '',
      isActive: true,
      restaurantId,
      branchId,
    });
  };

  // CRUD operations
  const handleCreate = async () => {
    try {
      await addInventory({ ...newItem, restaurantId, branchId }).unwrap();
      toast.success('Inventory item added successfully');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add inventory item');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateInventory({ id: selectedItem._id, ...selectedItem, branchId }).unwrap();
      toast.success('Inventory item updated successfully');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update inventory item');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInventory({ id: selectedItem._id, branchId }).unwrap();
      toast.success('Inventory item deleted successfully');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete inventory item');
    }
  };

  const handleConfirm = () => {
    if (modalType === 'add') {
      handleCreate();
    } else if (modalType === 'edit') {
      handleUpdate();
    } else if (modalType === 'delete') {
      handleDelete();
    }
  };

  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      setNewItem(prev => ({ ...prev, [field]: value }));
    } else {
      setSelectedItem(prev => ({ ...prev, [field]: value }));
    }
  };

  const getFormValue = (field) => {
    return modalType === 'add' ? newItem[field] : selectedItem?.[field] || '';
  };

  // Quick stock update
const handleQuickStockUpdate = async (item, delta) => {
  try {
    const newQuantity = Math.max(0, item.currentQuantity + delta);  // Changed from item.quantity
    await updateInventory({
      id: item._id,
      currentQuantity: newQuantity  // Changed from quantity
    }).unwrap();
    toast.success(`Stock updated to ${newQuantity} ${item.unit}`);
  } catch (error) {
    toast.error('Failed to update stock');
  }
};

  const unitConfigs = {
    kg: { min: 1, step: 1 },        // Kilogram: whole numbers
    gram: { min: 0.1, step: 0.1 },  // Gram: decimals
    liter: { min: 1, step: 1 },     // Liter: whole numbers
    ml: { min: 0.1, step: 0.1 },    // Milliliter: decimals
    piece: { min: 1, step: 1 },     // Piece: whole numbers
    box: { min: 1, step: 1 },       // Box: whole numbers
    packet: { min: 1, step: 1 },    // Packet: whole numbers
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Track and manage your restaurant inventory</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => handleOpen('add')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search by name, category, or supplier"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Items</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="name">Name</option>
                <option value="quantity">Quantity</option>
                <option value="lastUpdated">Last Updated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading && <TableLoading />}
          {isError && <p className="text-red-600 p-6">Failed to load inventory items.</p>}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Current Stock</th>
                    <th className="p-3 text-left">Min Stock</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Unit Cost</th>
                    <th className="p-3 text-left">Supplier</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => {
                    const stockStatus = getStockStatus(item);
                    return (
                      <tr
                        key={item._id}
                        className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}
                      >
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {item.category || 'Uncategorized'}
                          </span>
                        </td>
                         <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">{item?.currentQuantity}</span>
                          </div>
                          
                        </td>
                        <td className="p-3">
                          <span className="text-gray-600">{item.minQuantity} {item.unit}</span> 
                          {/* <div className="flex gap-1">
                          <button
                            onClick={() => handleQuickStockUpdate(item, -1)}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                            title="Decrease by 1"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleQuickStockUpdate(item, 1)}
                            className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded"
                            title="Increase by 1"
                          >
                            +
                          </button>
                        </div> */}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getStockStatusIcon(item)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                              {stockStatus.status.replace('-', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-600">₹{item.costPerUnit || 0}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-gray-600">{item.supplier || 'N/A'}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpen('view', item)}
                              className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                              title="View"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpen('edit', item)}
                              className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpen('delete', item)}
                              className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                              title="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* No Data */}
          {!isLoading && paginatedData?.length === 0 && (
            <div className="h-[200px] flex justify-center items-center w-full p-2 text-neutral-700">
              <div>No inventory items found</div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({filteredAndSortedData.length} items)
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
          title={
            modalType === 'view' ? 'View Inventory Item' :
              modalType === 'edit' ? 'Edit Inventory Item' :
                modalType === 'add' ? 'Add Inventory Item' :
                  'Delete Inventory Item'
          }
          onClose={handleClose}
          onConfirm={modalType === 'delete' ? handleConfirm : null}
          confirmText={modalType === 'delete' ? 'Delete' : modalType === 'add' ? 'Add' : 'Save'}
          showFooter={modalType === 'delete'}
        >
          {modalType === 'view' && selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white-700">Name</label>
                  <p className="text-white-900">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700">Category</label>
                  <p className="text-white-900">{selectedItem.category || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700">Current Quantity</label>
                  <p className="text-white-900">{selectedItem.currentQuantity} {selectedItem.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700">Min Quantity</label>
                  <p className="text-white-900">{selectedItem.minQuantity} {selectedItem.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700">Unit Cost</label>
                  <p className="text-white-900">₹{selectedItem.costPerUnit || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700">Supplier</label>
                  <p className="text-white-900">{selectedItem.supplier || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700">Location</label>
                  <p className="text-white-900">{selectedItem.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700">Status</label>
                  <div className="flex items-center gap-2">
                    {getStockStatusIcon(selectedItem)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(selectedItem).bg} ${getStockStatus(selectedItem).color}`}>
                      {getStockStatus(selectedItem).status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
              {selectedItem.description && (
                <div>
                  <label className="block text-sm font-medium text-white-700">Description</label>
                  <p className="text-gray-900">{selectedItem.description}</p>
                </div>
              )}
            </div>
          )}

          {(modalType === 'edit' || modalType === 'add') && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    value={getFormValue('name')}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={getFormValue('category')}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g., Vegetables, Meat, Dairy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Unit *</label>
                  <select
                    value={getFormValue('unit')}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram (g)</option>
                    <option value="liter">Liter (L)</option>
                    <option value="ml">Milliliter (ml)</option>
                    <option value="piece">Piece</option>
                    <option value="box">Box</option>
                    <option value="packet">Packet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Current Quantity *</label>
                  <input
                    type="number"
                    value={getFormValue('currentQuantity')}
                    onChange={(e) => {
                      const selectedUnit = getFormValue('unit');
                      const config = unitConfigs[selectedUnit] || { min: 0, step: 0.01 }; // Fallback
                      let newValue = parseFloat(e.target.value) || 0;

                      // Clamp to min value
                      if (newValue < config.min) newValue = config.min;

                      handleInputChange('currentQuantity', newValue);
                    }}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min={unitConfigs[getFormValue('unit')]?.min || 0}  // Dynamic min
                    step={unitConfigs[getFormValue('unit')]?.step || 0.01}  // Dynamic step
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Min Quantity *</label>
                  <input
                    type="number"
                    value={getFormValue('minQuantity')}
                    onChange={(e) => handleInputChange('minQuantity', parseFloat(e.target.value) || 0)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Max Quantity</label>
                  <input
                    type="number"
                    value={getFormValue('maxQuantity')}
                    onChange={(e) => handleInputChange('maxQuantity', parseFloat(e.target.value) || 0)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Cost Per Unit (₹)</label>
                  <input
                    type="number"
                    value={getFormValue('costPerUnit')}
                    onChange={(e) => handleInputChange('costPerUnit', parseFloat(e.target.value) || 0)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={getFormValue('supplier')}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={getFormValue('location')}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Storage location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={getFormValue('expiryDate')}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={getFormValue('isActive')}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white-700 mb-1">Description</label>
                <textarea
                  value={getFormValue('description')}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Item description"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
                disabled={isAdding || isUpdating}
              >
                {isAdding || isUpdating ? 'Saving...' : (modalType === 'add' ? 'Add Item' : 'Update Item')}
              </button>
            </form>
          )}

          {modalType === 'delete' && selectedItem && (
            <div>
              <p className="text-white-700 mb-4">
                Are you sure you want to delete <strong>{selectedItem.name}</strong>? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  <strong>Warning:</strong> This will permanently remove the inventory item and all its data.
                </p>
              </div>
            </div>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}
