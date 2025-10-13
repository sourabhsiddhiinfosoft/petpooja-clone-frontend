"use client";
import { useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import { useCreateOrderMutation } from "../../../store/api/ownerApi";

export default function CreateOrderPage() {
  const [formData, setFormData] = useState({
    restaurantId: "",
    tableId: "",
    customer: { name: "", phone: "" },
    type: "dine-in",
    items: [{ menuItem: "", qty: 1, addons: [], notes: "" }],
    paymentMethod: "cash",
  });

  const [createOrder, { isLoading, isError, error }] = useCreateOrderMutation();

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle nested customer input changes
  const handleCustomerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));
  };

  // Handle items array changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      items: newItems,
    }));
  };

  // Add new item row
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { menuItem: "", qty: 1, addons: [], notes: "" }],
    }));
  };

  // Remove item row
  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      items: newItems.length ? newItems : [{ menuItem: "", qty: 1, addons: [], notes: "" }],
    }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrder(formData).unwrap();
      alert("Order created successfully!");
      // Reset form or redirect as needed
      setFormData({
        restaurantId: "",
        tableId: "",
        customer: { name: "", phone: "" },
        type: "dine-in",
        items: [{ menuItem: "", qty: 1, addons: [], notes: "" }],
        paymentMethod: "cash",
      });
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  };

  return (
    <DashboardLayout userType="owner">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Restaurant ID */}
          <div>
            <label className="block mb-1 font-medium">Restaurant ID</label>
            <input
              type="text"
              value={formData.restaurantId}
              onChange={(e) => handleInputChange("restaurantId", e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>

          {/* Table ID */}
          <div>
            <label className="block mb-1 font-medium">Table ID</label>
            <input
              type="text"
              value={formData.tableId}
              onChange={(e) => handleInputChange("tableId", e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Customer Name</label>
              <input
                type="text"
                value={formData.customer.name}
                onChange={(e) => handleCustomerChange("name", e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Customer Phone</label>
              <input
                type="tel"
                value={formData.customer.phone}
                onChange={(e) => handleCustomerChange("phone", e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block mb-1 font-medium">Order Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="dine-in">Dine-in</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          {/* Items */}
          <div>
            <label className="block mb-1 font-medium">Items</label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="border rounded p-3 mb-3 space-y-2">
                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Menu Item ID"
                    value={item.menuItem}
                    onChange={(e) => handleItemChange(idx, "menuItem", e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    required
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Quantity"
                    value={item.qty}
                    onChange={(e) => handleItemChange(idx, "qty", Number(e.target.value))}
                    className="border rounded px-2 py-1 w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Addons (comma separated)"
                    value={item.addons.join(", ")}
                    onChange={(e) =>
                      handleItemChange(
                        idx,
                        "addons",
                        e.target.value.split(",").map((a) => a.trim()).filter(Boolean)
                      )
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    value={item.notes}
                    onChange={(e) => handleItemChange(idx, "notes", e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-red-600 hover:underline text-sm"
                  disabled={formData.items.length === 1}
                >
                  Remove Item
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              + Add Item
            </button>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block mb-1 font-medium">Payment Method</label>
            <div className="w-44">

            <select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
            </div>
          </div>
<div className="w-36 mx-auto">

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
          >
            {isLoading ? "Creating..." : "Create Order"}
          </button>
</div>

          {isError && (
            <p className="text-red-600 mt-2">
              Error creating order: {error?.data?.message || error?.error || "Unknown error"}
            </p>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
