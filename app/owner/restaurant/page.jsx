"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useMeQuery } from "../../../store/api/authApi";
import {
  useGetRestaurantDetailsQuery,
  useUpdateRestaurantDetailsMutation,
} from "../../../store/api/ownerApi";
import toast from "react-hot-toast";

export default function OwnerRestaurant() {
  const { data: userData } = useMeQuery();
  const restaurantId = userData?.restaurantId;

  const {
    data: restaurantData,
    isLoading,
    isError,
  } = useGetRestaurantDetailsQuery(restaurantId, { skip: !restaurantId });

  const [updateRestaurant] = useUpdateRestaurantDetailsMutation();

  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState({});

  useEffect(() => {
    if (restaurantData) {
      setFormState({
        name: restaurantData.name || "",
        slug: restaurantData.slug || "",
        city: restaurantData.city || "",
        state: restaurantData.state || "",
        country: restaurantData.country || "",
        address: restaurantData.address || "",
        cuisineType: restaurantData.cuisineType || "",
        logo: restaurantData?.logo || "",
        description: restaurantData.description || "",
        GSTIN: restaurantData.GSTIN || "",
        FSSAI: restaurantData.FSSAI || "",
        isActive: restaurantData.isActive || false,
        subscriptionStatus: restaurantData.subscriptionStatus || false,
      });
    }
  }, [restaurantData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateRestaurant({ id: restaurantId, ...formState }).unwrap();
      setEditMode(false);
      toast.success("Restaurant details updated successfully");
    } catch (err) {
        if(err?.data?.error){
            toast.error(err?.data?.error);
            return;
        }
      console.error("Update failed", err);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userType="owner">
        <p className="text-gray-500">Loading...</p>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout userType="owner">
        <p className="text-red-600">Failed to load restaurant details.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Restaurant</h1>
            <p className="text-gray-600">Manage your restaurant information</p>
          </div>
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {!editMode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={restaurantData?.logo}
                  alt={restaurantData?.name}
                  className="w-24 h-24 rounded object-cover border"
                />
                <div>
                  <h2 className="text-xl font-semibold">{restaurantData?.name}</h2>
                  <p className="text-gray-600">{restaurantData?.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <p><strong>Slug:</strong> {restaurantData?.slug}</p>
                <p><strong>City:</strong> {restaurantData?.city}</p>
                <p><strong>State:</strong> {restaurantData?.state}</p>
                <p><strong>Country:</strong> {restaurantData?.country}</p>
                <p><strong>Address:</strong> {restaurantData?.address}</p>
                <p><strong>Cuisine Type:</strong> {restaurantData?.cuisineType}</p>
                <p><strong>GSTIN:</strong> {restaurantData?.GSTIN}</p>
                <p><strong>FSSAI:</strong> {restaurantData?.FSSAI}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  {restaurantData?.isActive ? "Active ✅" : "Inactive ❌"}
                </p>
                <p>
                  <strong>Subscription:</strong>{" "}
                  {restaurantData?.subscriptionStatus ? "Subscribed" : "Not Subscribed"}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.keys(formState).map((key) => {
                  if (typeof formState[key] === "boolean") {
                    return (
                      <label key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name={key}
                          checked={formState[key]}
                          onChange={handleChange}
                        />
                        {key}
                      </label>
                    );
                  }
                  return (
                    <input
                      key={key}
                      type="text"
                      name={key}
                      value={formState[key]}
                      onChange={handleChange}
                      placeholder={key}
                      className="w-full border rounded px-3 py-2"
                    />
                  );
                })}
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
