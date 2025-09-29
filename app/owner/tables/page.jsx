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

export default function OwnerTables() {
  const { data: userData } = useMeQuery();
  const restaurantId = userData?.restaurantId;
  const { data: tablesData, isLoading, isError } = useGetTablesQuery(restaurantId);
  const { data: areasData } = useGetAreasQuery(restaurantId);

  const [createTable] = useAddTableMutation();
  const [deleteTable] = useDeleteTableMutation();
  const [updateTable] = useUpdateTableMutation();
  const [search, setSearch] = useState('');
  const [modalType, setModalType] = useState(null); // 'add' or 'edit'
  const [selectedTable, setSelectedTable] = useState(null);
  const [newTable, setNewTable] = useState({
    restaurantId: restaurantId,
    area: null,
    name: '',
    seats: 1,
    isActive: true,
  })

  const filteredData = useMemo(() => {
    return tablesData?.filter((cat) => (
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.area.name.toLowerCase().includes(search.toLowerCase()
      )))
  }, [search, tablesData]);


  const handleOpen = (type, item) => {
    if (type === 'add') {
      setNewTable({
        name: '',
        category: '',
        price: '',
        description: ''
      });
    } else {
      setSelectedTable(item ? { ...item } : null);
    }
    setModalType(type);
  };

  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      setNewTable((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setSelectedTable((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleClose = () => {
    setSelectedTable(null);
    setModalType(null);
  };

  const handleConfirm = async () => {
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
    try {
      await updateTable(selectedTable).unwrap();
      toast.success('Table updated successfully.');
    } catch (error) {
      toast.error('Failed to update table.');
    }
  };

  const handleCreate = async () => {
    try {
      await createTable(newTable).unwrap();
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
                      {/* <DeleteIcon width={15} height={15} className={'fill-red-600'} aria-label="Delete area" /> */}
                      <TrashIcon className="h-4 w-4" aria-label="Delete table" />
                    </button>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">{table?.name}</h2>
                  <p className="text-gray-600">Area: {table?.area?.name || 0}</p>
                  <p className="text-gray-600">Seats: {table?.seats || 0}</p>
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
                <b>Seat's</b>:{selectedTable?.seats || 0}
              </p>
              {/* <p>
                                      <b>Status:</b>{' '}
                                      {selectedTable?.isActive ? (
                                        <span className="text-green-600 font-semibold">Active</span>
                                      ) : (
                                        <span className="text-gray-400">Inactive</span>
                                      )}
                                    </p> */}
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
                  value={modalType === 'add' ? newTable.name : selectedTable.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Name"
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>

              <hr className="my-2" />

              <div className='mb-2'>
                <label className="block mb-1 font-medium">Seat's</label>
                <input
                  type="number"
                  value={modalType === 'add' ? newTable.seats : selectedTable.seats}
                  onChange={(e) => handleInputChange('seats', e.target.value)}
                  placeholder="Enter number of seats"
                  className="border rounded px-3 py-2 w-full [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                  required
                  min="1"
                  step="1"

                />
              </div>
              <hr />
              <div className='mb-2'>
                <label className="block mb-1 font-medium">Area's</label>
                <select
                  value={modalType === 'add' ? newTable.area :selectedTable.area?._id}
                  onChange={(e) => setNewTable((prev) => ({ ...prev, area: e.target.value }))}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                >
                  <option value="">Select Area</option>
                  {areasData &&
                    areasData.map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
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
