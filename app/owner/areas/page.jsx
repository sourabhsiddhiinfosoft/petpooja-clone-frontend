"use client";
import { useState, useMemo } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { TilesCardLoading } from '../../../components/Loading/TilesCardLoading';
import { useMeQuery } from '../../../store/api/authApi';
import { useAddAreaMutation, useDeleteAreaMutation, useGetAreasQuery, useUpdateAreaMutation } from '../../../store/api/ownerApi';
import { ModalBox } from '../../../components/ModalBox';
import toast from 'react-hot-toast';
import { EyeIcon as HeroEyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import Select from 'react-select'; // Import React Select
import { darkStyles } from '../../../styles/darkmodeSelect';
import { NoDataAvailableCard } from '../../../components/NoDataAvailable';

export default function OwnerAreas() {
  const { data: userData } = useMeQuery();
  const restaurantId = userData?.restaurantId;
  const { currentBranch, branches } = useCurrentBranch(); // Added for branches
  const branchId = currentBranch?._id || "";
  const q = `${restaurantId}${branchId ? `?branchId=${branchId}` : ""}`
  const { data: areasData, isLoading, isError } = useGetAreasQuery(q, { skip: !restaurantId && !branchId });
  const [createArea] = useAddAreaMutation();
  const [deleteArea] = useDeleteAreaMutation();
  const [updateArea] = useUpdateAreaMutation();
  const [modalType, setModalType] = useState(null); // 'add' or 'edit'
  const [selectedArea, setSelectedArea] = useState(null);
  const [newArea, setNewArea] = useState({
    restaurantId: restaurantId,
    name: '',
    description: '',
    isActive: true,
    type: 'single', // New: Apply To type
    branchIds: branchId ? [branchId] : [], // New: Pre-select current branch as array
  });

  console.log(" Data:", areasData);

  // Prepare options for React Select (branches)
  const branchOptions = useMemo(() => {
    return branches.map((branch) => ({
      value: branch._id,
      label: `${branch.name} - ${branch.address?.city || 'N/A'} (${branch.status})`,
    }));
  }, [branches]);


  // Get current form values for display (unified for add/edit)
  const getFormValue = (field) => {
    return modalType === 'add' ? newArea[field] : selectedArea?.[field] || '';
  };

  // Get current branch options for React Select
  const getCurrentBranchOptions = () => {
    const currentBranchIds = getFormValue('branchIds') || [];
    return currentBranchIds.map((id) =>
      branchOptions.find((opt) => opt.value === id)
    ).filter(Boolean); // Filter out nulls
  };

  const handleOpen = (type, area) => {
    if (type === 'add') {
      setNewArea({
        restaurantId: restaurantId,
        name: '',
        description: '',
        isActive: true,
        type: 'single', // New
        branchIds: branchId ? [branchId] : [], // New: Pre-select current
      });
    } else {
      // For edit: Ensure branchIds/type are set
      setSelectedArea(area ? {
        ...area,
        branchIds: area.branchIds || [branchId], // New: Ensure array
        type: area.type || 'single', // New
      } : null);
    }
    setModalType(type);
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
      setNewArea((prev) => ({ ...prev, branchIds: newBranchIds }));
    } else {
      setSelectedArea((prev) => ({ ...prev, branchIds: newBranchIds }));
    }
  };

  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      let updated = { ...newArea, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = []; // Empty for all
        } else if (value === 'single' && newArea.branchIds.length > 1) {
          updated.branchIds = [newArea.branchIds[0] || branchId]; // Keep first or current
        }
      }

      setNewArea(updated);
    } else {
      let updated = { ...selectedArea, [field]: value };

      if (field === 'type') {
        if (value === 'all') {
          updated.branchIds = []; // Empty for all
        } else if (value === 'single' && selectedArea.branchIds.length > 1) {
          updated.branchIds = [selectedArea.branchIds[0]]; // Keep first
        }
      }

      setSelectedArea(updated);
    }
  };

  const handleClose = () => {
    setSelectedArea(null);
    setModalType(null);
    // Reset newArea on close
    setNewArea({
      restaurantId: restaurantId,
      name: '',
      description: '',
      isActive: true,
      type: 'single',
      branchIds: branchId ? [branchId] : [],
    });
  };

  const handleConfirm = async () => {
    // New: Branch validation
    const currentType = getFormValue('type');
    const currentBranchIds = getFormValue('branchIds') || [];
    if ((currentType === 'single' || currentType === 'multiple') && currentBranchIds.length === 0) {
      toast.error('Please select at least one branch.');
      return;
    }

    if (modalType === 'delete') {
      if (selectedArea && selectedArea._id) {
        await handleDelete(selectedArea._id);
      }
    } else if (modalType === 'edit') {
      if (selectedArea && selectedArea._id) {
        await handleUpdate();
      }
    } else if (modalType === 'add') {
      await handleCreate();
    }
    handleClose();
  };

  const handleUpdate = async () => {
    if (!selectedArea?._id) return;
    try {
      const updatedArea = {
        ...selectedArea,
        restaurantId,
        branchIds: selectedArea.type === 'all' ? [] : (selectedArea.branchIds || []), // New: Process branchIds
      };
      await updateArea(updatedArea).unwrap();
      toast.success('Area updated successfully.');
    } catch (error) {
      toast.error('Failed to update area.');
    }
  };

  const handleCreate = async () => {
    try {
      const areaToCreate = {
        ...newArea,
        restaurantId,
        branchIds: newArea.type === 'all' ? [] : (newArea.branchIds || []), // New: Process branchIds
      };
      await createArea(areaToCreate).unwrap();
      toast.success('Area added successfully.');
    } catch (error) {
      toast.error('Failed to add area.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteArea(id).unwrap();
      toast.success('Area deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete area.');
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Areas</h1>
              <p className="text-gray-600">Manage areas/sections of the restaurant</p>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => handleOpen('add')}
            >
              + Add Area
            </button>
          </div>
        </div>
        {/*Area's */}
        <div className="p-6">
          {isLoading && <TilesCardLoading columns={3} />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {areasData && areasData.length > 0 && (
              areasData?.map((area) => (
                <div key={area._id} className="bg-white rounded-lg shadow p-6 relative">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      title="Edit"
                      className="p-0.5 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      onClick={() => handleOpen('edit', area)}
                    >
                      <PencilSquareIcon className="h-4 w-4" aria-label="Edit area" />
                    </button>
                    <button
                      title="View"
                      className="p-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                      onClick={() => handleOpen('view', area)}
                    >
                      <HeroEyeIcon className="h-4 w-4 text-black" />
                    </button>
                    <button
                      title="Delete"
                      className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => handleOpen('delete', area)}
                    >
                      <TrashIcon className="h-4 w-4" aria-label="Delete area" />
                    </button>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">{area.name}</h2>
                  <p className="text-gray-600">Tables: {area.tablesCount || 0}</p>
                  {/* New: Show branch info if available */}
                  {area.branchIds && (
                    <p className="text-gray-600 text-sm">Branches: {area.branchIds.length}</p>
                  )}
                </div>
              ))
            )}
            {!isLoading && areasData?.length == 0 && (
              <NoDataAvailableCard />
            )}
          </div>
        </div>

        {/* Modals */}
        <ModalBox
          active={!!modalType}
          title={
            modalType === 'view'
              ? 'View Area'
              : modalType === 'edit'
                ? 'Edit Area'
                : modalType === 'add'
                  ? 'Add Area'
                  : 'Delete Area'
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
          {modalType === 'view' && selectedArea && (
            <div>
              <p>
                <b>Name:</b> {selectedArea?.name || 'N/A'}
              </p>
              <p>
                <b>Description:</b> {selectedArea?.description || 'N/A'}
              </p>
              <p>
                <b>Tables:</b> {selectedArea?.tablesCount || 0}
              </p>
              {/* New: Show type and branches */}
              <p>
                <b>Apply To:</b> {selectedArea?.type || 'N/A'} | <b>Branches:</b> {selectedArea?.branchIds?.length || 0}
              </p>
              <p>
                <b>Status:</b>{' '}
                {selectedArea?.isActive ? (
                  <span className="text-green-600 font-semibold">Active</span>
                ) : (
                  <span className="text-gray-400">Inactive</span>
                )}
              </p>
            </div>
          )}

          {(modalType === 'edit' || modalType === 'add') && (selectedArea || modalType === 'add') && (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await handleConfirm();
              }}
            >
              <div className='mb-2'>
                <label className="block mb-1 font-medium">Area Name</label>
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
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  value={getFormValue('description')}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description"
                  className="border rounded px-3 py-2 w-full"
                  rows={3}
                />
              </div>

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

          {modalType === 'delete' && selectedArea && (
            <p>
              Are you sure you want to delete <b>{selectedArea.name}</b>?
            </p>
          )}
        </ModalBox>
      </div>
    </DashboardLayout>
  );
}


