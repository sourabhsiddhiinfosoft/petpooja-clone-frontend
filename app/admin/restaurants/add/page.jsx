"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../../components/DashboardLayout";
import toast from "react-hot-toast";
import { useCreateRestaurantMutation } from "../../../../store/api/adminApi";
import { createSlug } from "../../../../lib/helpers";

function sanitizeInput(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F<>]/g, "").trim();
}



export default function AddRestaurantPage() {
  const router = useRouter();
  const [createRestaurant, { isLoading }] = useCreateRestaurantMutation();

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
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerPassword: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    // if (!form.slug.trim()) e.slug = "Slug is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!form.country.trim()) e.country = "Country is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.cuisine.trim()) e.cuisine = "Cuisine is required";
    // Owner required on Add
    if (!form.ownerName.trim()) e.ownerName = "Owner name is required";
    if (!form.ownerEmail.trim()) e.ownerEmail = "Owner email is required";
    if (!form.ownerPhone.trim()) e.ownerPhone = "Owner phone is required";
    if (!form.ownerPassword.trim()) e.ownerPassword = "Owner password is required";
    return e;
  }, [form]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => router.push("/admin/restaurants");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      toast.error("Please fix validation errors");
      return;
    }
    try {
      const payload = {
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
        isActive: !!form.isActive,
        ownerName: sanitizeInput(form.ownerName),
        ownerEmail: sanitizeInput(form.ownerEmail),
        ownerPhone: sanitizeInput(form.ownerPhone),
        ownerPassword: sanitizeInput(form.ownerPassword),
      };
      await createRestaurant(payload).unwrap();
      toast.success("Restaurant created");
      router.push("/admin/restaurants");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create restaurant");
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Add Restaurant</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.name}
                aria-describedby={submitted && errors.name ? "name-error" : undefined}
                required
              />
              {submitted && errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={!!errors.slug}
                aria-describedby={errors.slug ? "slug-error" : undefined}
                required
              />
              {errors.slug && (
                <p id="slug-error" className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
            </div> */}

            <div>
              <label className="block text-sm font-bold text-gray-700">Address<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.address}
                aria-describedby={submitted && errors.address ? "address-error" : undefined}
                required
              />
              {submitted && errors.address && (
                <p id="address-error" className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">City<span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-bold text-gray-700">State<span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-bold text-gray-700">Country<span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-bold text-gray-700">Cuisine<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.cuisine}
                onChange={(e) => handleChange("cuisine", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.cuisine}
                aria-describedby={submitted && errors.cuisine ? "cuisine-error" : undefined}
                required
              />
              {submitted && errors.cuisine && (
                <p id="cuisine-error" className="mt-1 text-sm text-red-600">{errors.cuisine}</p>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Logo URL</label>
              <input
                type="url"
                value={form.logo}
                onChange={(e) => handleChange("logo", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700">Description<span className="text-red-500">*</span></label>
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
              <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Active</label>
            </div>

            {/* Owner details for Add */}
            <div>
              <label className="block text-sm font-bold text-gray-700">Owner Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => handleChange("ownerName", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.ownerName}
                aria-describedby={submitted && errors.ownerName ? "ownerName-error" : undefined}
                required
              />
              {submitted && errors.ownerName && <p id="ownerName-error" className="mt-1 text-sm text-red-600">{errors.ownerName}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Owner Phone<span className="text-red-500">*</span></label>
              <input
                type="tel"
                value={form.ownerPhone}
                onChange={(e) => handleChange("ownerPhone", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.ownerPhone}
                aria-describedby={submitted && errors.ownerPhone ? "ownerPhone-error" : undefined}
                required
              />
              {submitted && errors.ownerPhone && <p id="ownerPhone-error" className="mt-1 text-sm text-red-600">{errors.ownerPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Owner Email<span className="text-red-500">*</span></label>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(e) => handleChange("ownerEmail", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.ownerEmail}
                aria-describedby={submitted && errors.ownerEmail ? "ownerEmail-error" : undefined}
                required
              />
              {submitted && errors.ownerEmail && <p id="ownerEmail-error" className="mt-1 text-sm text-red-600">{errors.ownerEmail}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">Owner Password<span className="text-red-500">*</span></label>
              <input
                type="password"
                value={form.ownerPassword}
                onChange={(e) => handleChange("ownerPassword", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.ownerPassword}
                aria-describedby={submitted && errors.ownerPassword ? "ownerPassword-error" : undefined}
                required
              />
              {submitted && errors.ownerPassword && <p id="ownerPassword-error" className="mt-1 text-sm text-red-600">{errors.ownerPassword}</p>}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => handleChange("rating", e.target.value)}
                className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-invalid={submitted && !!errors.rating}
                aria-describedby={submitted && errors.rating ? "rating-error" : undefined}
              />
              {submitted && errors.rating && (
                <p id="rating-error" className="mt-1 text-sm text-red-600">{errors.rating}</p>
              )}
            </div> */}
          </div>

          <div className="mt-6 flex gap-3">
            <button type="submit" disabled={isLoading} className="bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Save
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}


