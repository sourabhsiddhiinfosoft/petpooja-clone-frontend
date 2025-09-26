"use client";
import { useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import { TilesCardLoading } from '../../../components/Loading/TilesCardLoading';
import { useMeQuery } from '../../../store/api/authApi';
import { useAddAreaMutation, useDeleteAreaMutation, useGetAreasQuery, useUpdateAreaMutation } from '../../../store/api/ownerApi';
import { ModalBox } from '../../../components/ModalBox';
import toast from 'react-hot-toast';
import { DeleteIcon, deleteIcon, EyeIcon } from '../../../lib/commanSvgs';
import { EyeIcon as HeroEyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function OwnerAreas() {

  const { data: userData } = useMeQuery();
  const restaurantId = userData?.restaurantId;
  const { data: areasData, isLoading, isError } = useGetAreasQuery(restaurantId);
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
  })

  console.log(" Data:", areasData);

  const handleOpen = (type, area) => {
    if (type === 'add') {
      setNewArea({
        name: '',
        category: '',
        price: '',
        description: '',
        isActive: true,
      });
    } else {
      setSelectedArea(area ? { ...area } : null);
    }
    setModalType(type);
  };

  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      setNewArea((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setSelectedArea((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleClose = () => {
    setSelectedArea(null);
    setModalType(null);
  };

  const handleConfirm = async () => {
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
    try {
      await updateArea(selectedArea).unwrap();
      toast.success('Area updated successfully.');
    } catch (error) {
      toast.error('Failed to update area.');
    }
  };

  const handleCreate = async () => {
    try {
      await createArea(newArea).unwrap();
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
              areasData.map((area) => (
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
                      {/* <DeleteIcon width={15} height={15} className={'fill-red-600'} aria-label="Delete area" /> */}
                      <TrashIcon className="h-4 w-4" aria-label="Delete area" />
                    </button>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">{area.name}</h2>
                  <p className="text-gray-600">Tables: {area.tablesCount || 0}</p>
                </div>
              ))
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
                <b>Table's</b>:{selectedArea?.tablesCount || 0}
              </p>
              {/* <p>
                            <b>Status:</b>{' '}
                            {selectedArea?.isActive ? (
                              <span className="text-green-600 font-semibold">Active</span>
                            ) : (
                              <span className="text-gray-400">Inactive</span>
                            )}
                          </p> */}
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
                  value={modalType === 'add' ? newArea.name : selectedArea.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Name"
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>

              <hr className="my-2" />

              <label className="block mb-1 font-medium">Description</label>
              <textarea
                value={modalType === 'add' ? newArea.description : selectedArea.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description"
                className="border rounded px-3 py-2 w-full"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={modalType === 'add' ? newArea.isActive : selectedArea.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
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


