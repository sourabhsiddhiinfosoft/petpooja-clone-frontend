"use client";
import { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useMeQuery } from "../../../store/api/authApi";
import { useCreateBranchMutation, useDeleteBranchMutation, useListBranchesForRestaurantQuery, useUpdateBranchMutation } from "../../../store/api/ownerApi";
import { TableLoading } from "../../../components/Loading/tableLoading";
import { EyeIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ModalBox } from "../../../components/ModalBox";
import toast from "react-hot-toast";


export default function BranchesPage() {
  const { data: userData } = useMeQuery();
  const restaurantId = userData?.restaurantId;

  const { data: branches, isLoading } = useListBranchesForRestaurantQuery(restaurantId, {
    skip: !restaurantId,
  });

  const [createBranch] = useCreateBranchMutation()
  const [deleteBranch] = useDeleteBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();

  const [newBranch, setNewBranch] = useState()
  const [selectedBranch, setSelectedBranch] = useState(null); // for edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [modalType, setModalType] = useState(null);


  const handleOpen = (type, item) => {
    if (type === 'add') {
      setNewBranch({
        name: '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: '',
          lat: '',
          lng: '',
        },
        manager: {
          name: '',
          phone: '',
          email: '',
        },
        tables: 0,
        status: 'active', // default status
        restaurantId:restaurantId
      });

    } else {
      setSelectedBranch(item ? { ...item } : null);
    }
    setModalType(type);
    setIsModalOpen(true)
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
    setNewBranch(null);
    setModalType(null);
  };

const handleConfirm = async () => {
  if (modalType === "delete") {
    if (selectedBranch && selectedBranch._id) {
      await handleDelete(selectedBranch._id);
    }
  } else if (modalType === "edit") {
    if (selectedBranch && selectedBranch._id) {
      await handleUpdate();
    }
  } else if (modalType === "add") {
    if (newBranch) {
      await handleAdd();
    }
  }
  handleClose();
};


  const handleDelete = async (id) => {
    try {
      await deleteBranch(id).unwrap();
      toast.success("Branch deleted successfully.");
    } catch (error) {
      console.error("Failed to delete the branch: ", error);
      toast.error("Failed to delete the branch.");
    }
  };

  const handleUpdate = async () => {
    try {
      await updateBranch(selectedBranch).unwrap();
      toast.success("Branch updated successfully.");
    } catch (error) {
      console.error("Failed to update the branch: ", error);
      toast.error("Failed to update the branch.");
    }
  };

  const handleAdd = async () => {
    try {
      await createBranch(newBranch).unwrap();
      toast.success("Branch added successfully.");
    } catch (error) {
      console.error("Failed to add the branch: ", error);
      toast.error("Failed to add the branch.");
    }
  };
  // Handle input changes for edit/add form
  const handleInputChange = (field, value) => {
    if (modalType === 'add') {
      setNewBranch((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setSelectedBranch((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
              <p className="text-gray-600">Manage your restaurant branches</p>
            </div>
            <div className='flex gap-4'>
              <input
                type="text"
                placeholder="Search by order id,name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm w-72 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />

              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                onClick={() => handleOpen('add')}
              >
                + Add Branch
              </button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <TableLoading />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">City</th>
                    <th className="px-4 py-2">Manager</th>
                    <th className="px-4 py-2">Tables</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branches?.map((branch, idx) => (
                    <tr
                      key={branch._id}
                      className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                        } hover:bg-blue-50 transition`}
                    >
                      <td className="p-3">{branch.name}</td>
                      <td className="p-3">{branch.address?.city}</td>
                      <td className="p-3">
                        {branch.manager?.name || "N/A"}
                      </td>
                      <td className="p-3">{branch.tables}</td>
                      <td className="p-3">{branch.status}</td>
                      <td className="p-3 flex gap-3">
                        <button
                          title="Edit"
                          className="p-2 rounded-full bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          onClick={() => handleOpen('edit', branch)}
                        >
                          <PencilSquareIcon className="h-4 w-4" aria-label="Edit data" />
                        </button>
                        <button
                          title="View"
                          className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => handleOpen('view', branch)}
                        >
                          <EyeIcon className="h-4 w-4 text-black" aria-label='View data' />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={() => handleOpen('delete', branch)}
                        >
                          <TrashIcon className="h-4 w-4" aria-label="Delete table" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Modal */}

        {(isModalOpen && (modalType === "add" || modalType === "edit" || modalType === "view" || modalType === "delete")) && (
          <ModalBox
            active={!!modalType}
            title={
              modalType === "view"
                ? "View Branch"
                : modalType === "edit"
                  ? "Edit Branch"
                  : modalType === "add"
                    ? "Add Branch"
                    : "Delete Branch"
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
            size={modalType === ("add" || "edit") ? "3xl" : "md"}
          >
            {modalType === "view" && selectedBranch && (
              <div>
                <p><b>Name:</b> {selectedBranch.name || "N/A"}</p>
                <p><b>City:</b> {selectedBranch.address?.city || "N/A"}</p>
                <p><b>Manager:</b> {selectedBranch.manager?.name || "N/A"}</p>
                <p><b>Tables:</b> {selectedBranch.tables || "N/A"}</p>
                <p><b>Status:</b> {selectedBranch.status || "N/A"}</p>
              </div>
            )}

            {(modalType === "edit" || modalType === "add") && (
              <form
                className="space-y-3 max-h-[70vh] overflow-y-auto pr-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleConfirm();
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Branch Name */}
                  <div>
                    <label className="block mb-1 font-medium">Branch Name</label>
                    <input
                      type="text"
                      value={modalType === "add" ? newBranch?.name || "" : selectedBranch?.name || ""}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Branch Name"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block mb-1 font-medium">Status</label>
                    <select
                      value={modalType === "add" ? newBranch?.status || "active" : selectedBranch?.status || "active"}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Street */}
                  <div>
                    <label className="block mb-1 font-medium">Street</label>
                    <input
                      type="text"
                      value={modalType === "add" ? newBranch?.address?.street || "" : selectedBranch?.address?.street || ""}
                      onChange={(e) => {
                        const street = e.target.value;
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, street },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, street },
                          }));
                        }
                      }}
                      placeholder="Street"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block mb-1 font-medium">City</label>
                    <input
                      type="text"
                      value={modalType === "add" ? newBranch?.address?.city || "" : selectedBranch?.address?.city || ""}
                      onChange={(e) => {
                        const city = e.target.value;
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, city },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, city },
                          }));
                        }
                      }}
                      placeholder="City"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block mb-1 font-medium">State</label>
                    <input
                      type="text"
                      value={modalType === "add" ? newBranch?.address?.state || "" : selectedBranch?.address?.state || ""}
                      onChange={(e) => {
                        const state = e.target.value;
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, state },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, state },
                          }));
                        }
                      }}
                      placeholder="State"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block mb-1 font-medium">Pincode</label>
                    <input
                      type="text"
                      value={modalType === "add" ? newBranch?.address?.pincode || "" : selectedBranch?.address?.pincode || ""}
                      onChange={(e) => {
                        const pincode = e.target.value;
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, pincode },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, pincode },
                          }));
                        }
                      }}
                      placeholder="Pincode"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="block mb-1 font-medium">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={modalType === "add" ? newBranch?.address?.lat || "" : selectedBranch?.address?.lat || ""}
                      onChange={(e) => {
                        const lat = parseFloat(e.target.value);
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, lat },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, lat },
                          }));
                        }
                      }}
                      placeholder="Latitude"
                      className="border rounded px-3 py-2 w-full"
                      
                    />
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="block mb-1 font-medium">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={modalType === "add" ? newBranch?.address?.lng || "" : selectedBranch?.address?.lng || ""}
                      onChange={(e) => {
                        const lng = parseFloat(e.target.value);
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, lng },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            address: { ...prev?.address, lng },
                          }));
                        }
                      }}
                      placeholder="Longitude"
                      className="border rounded px-3 py-2 w-full"
                
                    />
                  </div>

                  {/* Manager Name */}
                  <div>
                    <label className="block mb-1 font-medium">Manager Name</label>
                    <input
                      type="text"
                      value={modalType === "add" ? newBranch?.manager?.name || "" : selectedBranch?.manager?.name || ""}
                      onChange={(e) => {
                        const name = e.target.value;
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            manager: { ...prev?.manager, name },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            manager: { ...prev?.manager, name },
                          }));
                        }
                      }}
                      placeholder="Manager Name"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* Manager Phone */}
                  <div>
                    <label className="block mb-1 font-medium">Manager Phone</label>
                    <input
                      type="tel"
                      value={modalType === "add" ? newBranch?.manager?.phone || "" : selectedBranch?.manager?.phone || ""}
                      onChange={(e) => {
                        const phone = e.target.value;
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            manager: { ...prev?.manager, phone },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            manager: { ...prev?.manager, phone },
                          }));
                        }
                      }}
                      placeholder="Manager Phone"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* Manager Email */}
                  <div>
                    <label className="block mb-1 font-medium">Manager Email</label>
                    <input
                      type="email"
                      value={modalType === "add" ? newBranch?.manager?.email || "" : selectedBranch?.manager?.email || ""}
                      onChange={(e) => {
                        const email = e.target.value;
                        if (modalType === "add") {
                          setNewBranch((prev) => ({
                            ...prev,
                            manager: { ...prev?.manager, email },
                          }));
                        } else {
                          setSelectedBranch((prev) => ({
                            ...prev,
                            manager: { ...prev?.manager, email },
                          }));
                        }
                      }}
                      placeholder="Manager Email"
                      className="border rounded px-3 py-2 w-full"
                      required
                    />
                  </div>

                  {/* Tables */}
                  <div>
                    <label className="block mb-1 font-medium">Tables</label>
                    <input
                      type="number"
                      value={modalType === "add" ? newBranch?.tables || 0 : selectedBranch?.tables || 0}
                      onChange={(e) => handleInputChange("tables", Number(e.target.value))}
                      placeholder="Number of tables"
                      className="border rounded px-3 py-2 w-full"
                      min={0}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full mt-4"
                >
                  {modalType === "add" ? "Add" : "Save"}
                </button>
              </form>

            )}

            {modalType === "delete" && selectedBranch && (
              <p>
                Are you sure you want to delete <b>{selectedBranch.name}</b>?
              </p>
            )}
          </ModalBox>
        )}
      </div>
    </DashboardLayout>
  );
}
