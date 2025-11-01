"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../../../components/DashboardLayout";
import toast from "react-hot-toast";
import { useGetRestaurantByIdQuery, useUpdateRestaurantMutation } from "../../../../../store/api/adminApi";
import { createSlug } from "../../../../../lib/helpers";

function sanitizeInput(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F<>]/g, "").trim();
}

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data, isLoading: isFetching, isError } = useGetRestaurantByIdQuery(id, { skip: !id });
  const [updateRestaurant, { isLoading: isSaving }] = useUpdateRestaurantMutation();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    city: "",
    state: "",
    country: "",
    address: "",
    cuisine: "",
    logo: "",
    description: "",
    GSTIN: "",
    FSSAI: "",
    isActive: true,
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        name: data?.name || "",
        slug: data?.slug || "",
        city: data?.city || "",
        state: data?.state || "",
        country: data?.country || "",
        address: data?.address || "",
        cuisine: data?.cuisineType || "",
        logo: data?.logo || "",
        description: data?.description || "",
        GSTIN: data?.GSTIN || "",
        FSSAI: data?.FSSAI || "",
        isActive: !!data?.isActive,
      });
    }
  }, [data]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    // if (!form.slug.trim()) e.slug = "Slug is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.cuisine.trim()) e.cuisine = "Cuisine is required";
    return e;
  }, [form]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleCancel = () => router.push("/admin/restaurants");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setSubmitted(true);
    if (Object.keys(errors).length) {
      toast.error("Please fix validation errors");
      return;
    }
    try {
      const payload = {
        _id: id,
        name: sanitizeInput(form.name),
        slug: createSlug(form.name),
        city: sanitizeInput(form.city),
        state: sanitizeInput(form.state),
        country: sanitizeInput(form.country),
        address: sanitizeInput(form.address),
        cuisineType: sanitizeInput(form.cuisine),
        logo: sanitizeInput(form.logo),
        description: sanitizeInput(form.description),
        GSTIN: sanitizeInput(form.GSTIN),
        FSSAI: sanitizeInput(form.FSSAI),
        isActive: !!form.isActive
      };
      await updateRestaurant(payload).unwrap();
      toast.success("Restaurant updated");
      router.push("/admin/restaurants");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update restaurant");
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Edit Restaurant</h1>
        </div>

        {isError && (
          <div className="text-red-600">Failed to load restaurant.</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl">
          <fieldset disabled={isFetching} className={isFetching ? "opacity-60" : ""}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={submitted && !!errors.name}
                  aria-describedby={submitted && errors.name ? "name-error" : undefined}
                  required
                />
                {submitted && errors.name && <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={submitted && !!errors.slug}
                  aria-describedby={submitted && errors.slug ? "slug-error" : undefined}
                  required
                />
                {submitted && errors.slug && <p id="slug-error" className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={submitted && !!errors.address}
                  aria-describedby={submitted && errors.address ? "address-error" : undefined}
                  required
                />
                {submitted && errors.address && <p id="address-error" className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={submitted && !!errors.city}
                  aria-describedby={submitted && errors.city ? "city-error" : undefined}
                  required
                />
                {submitted && errors.city && <p id="city-error" className="mt-1 text-sm text-red-600">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={submitted && !!errors.state}
                  aria-describedby={submitted && errors.state ? "state-error" : undefined}
                  required
                />
                {submitted && errors.state && <p id="state-error" className="mt-1 text-sm text-red-600">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={submitted && !!errors.country}
                  aria-describedby={submitted && errors.country ? "country-error" : undefined}
                  required
                />
                {submitted && errors.country && <p id="country-error" className="mt-1 text-sm text-red-600">{errors.country}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                <input
                  type="text"
                  value={form.cuisine}
                  onChange={(e) => handleChange("cuisine", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-invalid={submitted && !!errors.cuisine}
                  aria-describedby={submitted && errors.cuisine ? "cuisine-error" : undefined}
                  required
                />
                {submitted && errors.cuisine && <p id="cuisine-error" className="mt-1 text-sm text-red-600">{errors.cuisine}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  type="url"
                  value={form.logo}
                  onChange={(e) => handleChange("logo", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                <input
                  type="text"
                  value={form.GSTIN}
                  onChange={(e) => handleChange("GSTIN", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">FSSAI</label>
                <input
                  type="text"
                  value={form.FSSAI}
                  onChange={(e) => handleChange("FSSAI", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="submit" disabled={isSaving || isFetching} className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                Save
              </button>
              <button type="button" onClick={handleCancel} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </fieldset>
        </form>
      </div>
    </DashboardLayout>
  );
}


