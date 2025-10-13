"use client";
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../../../components/DashboardLayout';
import { TilesCardLoading } from '../../../components/Loading/TilesCardLoading';
import { useMeQuery } from '../../../store/api/authApi';
import { useAddTableMutation, useDeleteTableMutation, useGetAreasQuery, useGetTablesQuery, useUpdateTableMutation } from '../../../store/api/ownerApi';
import { useMemo, useState } from 'react';
import { ModalBox } from '../../../components/ModalBox';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie'; // Add this import
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import { NoDataAvailableCard } from '../../../components/NoDataAvailable';
import Select from 'react-select'; // Import React Select

export default function OwnerTables() {
  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || "";
  const branchId = currentBranch?._id || "";

  
  // const q = `${restaurantId}`;
  const q = `${restaurantId}${branchId ? `?branchId=${branchId}` : ""}`

  const { data: tablesData = [], isLoading, isError } = useGetTablesQuery(q, { skip: !restaurantId });
  const { data: areasData = [] } = useGetAreasQuery(q, { skip: !restaurantId });

  const [createTable] = useAddTableMutation();
  const [deleteTable] = useDeleteTableMutation();
  const [updateTable] = useUpdateTableMutation();
  const [search, setSearch] = useState('');
  const [modalType, setModalType] = useState(null); // 'add' or 'edit'
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({
    restaurantId: restaurantId,
    area: '', // ID string
    name: '',
    seats: 1,
    isActive: true,
    type: 'single', // New: Apply To type
    branchIds: branchId ? [branchId] : [], // New: Pre-select current branch as array
    branchId, // For single-branch fallback
  });

  // Filter tables
  const filteredData = useMemo(() => {
    return tablesData.filter((table) =>
      table.name.toLowerCase().includes(search.toLowerCase()) ||
      table.area?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, tablesData]);

  // Prepare options for React Select (areas)
  const areaOptions = useMemo(() => {
    return areasData.map((area) => ({
      value: area._id,
      label: area.name,
    }));
  }, [areasData]);

  // Prepare options for React Select (branches)
  const branchOptions = useMemo(() => {
    return branches.map((branch) => ({
      value: branch._id,
      label: `${branch.name} - ${branch.address?.city || 'N/A'} (${branch.status})`,
    }));
  }, [branches]);

  // Dark mode styles for React Select
  const darkStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#374151' : '#1f2937',
      borderColor: state.isFocused ? '#4f46e5' : '#4b5563',
      color: '#f9fafb',
      boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none',
      '&:hover': {
        borderColor: '#6b7280',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1f2937',
      borderColor: '#4b5563',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#4f46e5'
        : state.isFocused
          ? '#374151'
          : '#1f2937',
      color: state.isSelected ? '#ffffff' : '#f9fafb',
      '&:hover': {
        backgroundColor: '#374151',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
    input: (provided) => ({
      ...provided,
      color: '#f9fafb',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#f9fafb',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#374151',
      color: '#f9fafb',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#f9fafb',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#d1d5db',
      '&:hover': {
        backgroundColor: '#4b5563',
        color: '#ffffff',
      },
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: '#4b5563',
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  // Get current form values for display (unified for add/edit)
  const getFormValue = (field) => {
    return modalType === 'add' ? newTable[field] : selectedTable?.[field] || '';
  };

  // Get current area option for React Select
  const getCurrentAreaOption = () => {
    const currentAreaId = getFormValue('area');
    return areaOptions.find((opt) => opt.value === currentAreaId) || null;
  };

  // Get current branch options for React Select
  const getCurrentBranchOptions = () => {
    const currentBranchIds = getFormValue('branchIds') || [];
    return currentBranchIds.map((id) =>
      branchOptions.find((opt) => opt.value === id)
    ).filter(Boolean); // Filter out nulls
  };

  const handleOpen = (type, item) => {
    if (type === 'add') {
      setNewTable({
        restaurantId: restaurantId,
        area: '',
        name: '',
        seats: 1,
        isActive: true,
        type: 'single', // New
        branchIds: branchId ? [branchId] : [], // New: Pre-select current
        branchId,
      });
    } else {
      // For edit: Ensure area/branchIds/type are set
      setSelectedTable(item ? {
        ...item,
        area: item.area?._id || '', // Ensure ID string
        branchIds: item.branchIds || [branchId], // New: Ensure array
        type: item.type || 'single', // New
      } : null);
    }
    setModalType(type);
  };

  // Handle area change with React Select (unified for add/edit)
  const handleAreaChange = (selectedOption) => {
    const areaId = selectedOption ? selectedOption.value : '';
    if (modalType === 'add') {
      setNewTable((prev) => ({ ...prev, area: areaId }));
    } else {
      setSelectedTable((prev) => ({ ...prev, area: areaId }));
    }
  };

  // Handle branch change with React Select (unified for add/edit)
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
      setNewTable((prev) => ({ ...prev, branchIds: newBranchIds }));
    } else {
      setSelectedTable((prev) => ({ ...prev, branchIds: newBranchIds }));
    }
  };

  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      let updated = { ...newTable, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = []; // Empty for all
        } else if (value === 'single' && newTable.branchIds.length > 1) {
          updated.branchIds = [newTable.branchIds[0] || branchId]; // Keep first or current
        }
      }

      setNewTable(updated);
    } else {
      let updated = { ...selectedTable, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = []; // Empty for all
        } else if (value === 'single' && selectedTable.branchIds.length > 1) {
          updated.branchIds = [selectedTable.branchIds[0]]; // Keep first
        }
      }

      setSelectedTable(updated);
    }
  };

  const handleClose = () => {
    setSelectedTable(null);
    setModalType(null);
    // Reset newTable on close
    setNewTable({
      restaurantId: restaurantId,
      area: '',
      name: '',
      seats: 1,
      isActive: true,
      type: 'single',
      branchIds: branchId ? [branchId] : [],
      branchId,
    });
  };

  const handleConfirm = async () => {
    // Validation: Ensure area is selected
    const currentArea = getFormValue('area');
    if (!currentArea) {
      toast.error('Please select an area.');
      return;
    }

    // New: Branch validation
    const currentType = getFormValue('type');
    const currentBranchIds = getFormValue('branchIds') || [];
    if ((currentType === 'single' || currentType === 'multiple') && currentBranchIds.length === 0) {
      toast.error('Please select at least one branch.');
      return;
    }

    if (modalType === 'delete') {
      if (selectedTable && selectedTable._id) {
        await handleDelete(selectedTable._id);
      }
    } else if (modalType === 'edit') {
      if (selectedTable && selectedTable._id) {
        await handleUpdate();
      }
    } else if (modalType === 'add') {
      await handleCreate();
    }
    handleClose();
  };

  const handleUpdate = async () => {
    if (!selectedTable?._id) return;
    try {
      const updatedTable = {
        ...selectedTable,
        restaurantId,
        branchId,
        area: selectedTable.area, // Ensure ID
        branchIds: selectedTable.type === 'all' ? [] : (selectedTable.branchIds || []), // New: Process branchIds
      };
      await updateTable(updatedTable).unwrap();
      toast.success('Table updated successfully.');
    } catch (error) {
      toast.error('Failed to update table.');
    }
  };

  const handleCreate = async () => {
    try {
      const tableToCreate = {
        ...newTable,
        restaurantId,
        branchId,
        area: newTable.area, // Ensure ID
        branchIds: newTable.type === 'all' ? [] : (newTable.branchIds || []), // New: Process branchIds
      };
      await createTable(tableToCreate).unwrap();
      toast.success('Table added successfully.');
    } catch (error) {
      toast.error('Failed to add table.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTable(id).unwrap();
      toast.success('Table deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete table.');
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dining Tables</h1>
              <p className="text-gray-600">Manage your restaurant dining tables</p>
            </div>
            <div className='flex gap-4'>
              <input
                type="text"
                placeholder="Search by Table & Area name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => handleOpen('add')}
              >
                + Add Table
              </button>
            </div>
          </div>
        </div>
        {/*Tables's */}
        <div className="p-6">
          {isLoading && <TilesCardLoading columns={3} />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredData && filteredData.length > 0 && (
              filteredData.map((table) => (
                <div key={table._id} className="bg-white rounded-lg shadow p-6 relative">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      title="Edit"
                      className="p-0.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      onClick={() => handleOpen('edit', table)}
                    >
                      <PencilSquareIcon className="h-4 w-4" aria-label="Edit Table" />
                    </button>
                    <button
                      title="View"
                      className="p-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                      onClick={() => handleOpen('view', table)}
                    >
                      <EyeIcon className="h-4 w-4 text-black" />
                    </button>
                    <button
                      title="Delete"
                      className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => handleOpen('delete', table)}
                    >
                      <TrashIcon className="h-4 w-4" aria-label="Delete table" />
                    </button>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">{table?.name}</h2>
                  <p className="text-gray-600">Area: {table?.area?.name || 'N/A'}</p>
                  <p className="text-gray-600">Seats: {table?.seats || 0}</p>
                  {/* New: Show branch info if available */}
                  {table.branchIds && (
                    <p className="text-gray-600 text-sm">Branches: {table.branchIds.length}</p>
                  )}
                </div>
              ))
            )}

            {!isLoading && filteredData?.length === 0 && (
              <NoDataAvailableCard />
            )}
          </div>
        </div>
        {/* Modals */}
        <ModalBox
          active={!!modalType}
          title={
            modalType === 'view'
              ? 'View Table'
              : modalType === 'edit'
                ? 'Edit Table'
                : modalType === 'add'
                  ? 'Add Table'
                  : 'Delete Table'
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
          {modalType === 'view' && selectedTable && (
            <div>
              <p>
                <b>Name:</b> {selectedTable?.name || 'N/A'}
              </p>
              <p>
                <b>Area Name:</b> {selectedTable?.area?.name || 'N/A'}
              </p>
              <p>
                <b>Seats:</b> {selectedTable?.seats || 0}
              </p>
              {/* New: Show type and branches */}
              <p>
                <b>Apply To:</b> {selectedTable?.type || 'N/A'} | <b>Branches:</b> {selectedTable?.branchIds?.length || 0}
              </p>
              <p>
                <b>Status:</b>{' '}
                {selectedTable?.isActive ? (
                  <span className="text-green-600 font-semibold">Active</span>
                ) : (
                  <span className="text-gray-400">Inactive</span>
                )}
              </p>
            </div>
          )}

          {(modalType === 'edit' || modalType === 'add') && (selectedTable || modalType === 'add') && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleConfirm();
              }}
            >
              <div className='mb-2'>
                <label className="block mb-1 font-medium">Table Name</label>
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
                <label className="block mb-1 font-medium">Seats</label>
                <input
                  type="number"
                  value={getFormValue('seats')}
                  onChange={(e) => handleInputChange('seats', e.target.value)}
                  placeholder="Enter number of seats"
                  className="border rounded px-3 py-2 w-full"
                  required
                  min="1"
                  step="1"
                />
              </div>
              <hr className="my-2" />

              <div className='mb-2'>
                <label className="block mb-1 font-medium">Area</label>
                <Select
                  options={areaOptions}
                  value={getCurrentAreaOption()}
                  onChange={handleAreaChange}
                  placeholder="Select an area"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isClearable={true}
                  isDisabled={!areasData || areasData.length === 0}
                  styles={darkStyles}
                />
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

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={getFormValue('isActive')}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
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

          {modalType === 'delete' && selectedTable && (
            <p>
              Are you sure you want to delete <b>{selectedTable.name}</b>?
            </p>
          )}
        </ModalBox>
      </div>
    </DashboardLayout >
  );
}
