"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useApplyDiscountMutation, useGetDiscountsQuery, useRemoveDiscountMutation } from "../store/api/ownerApi";
import { TagIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ApplyDiscountSection({ orderId, branchId, currentOrder, onOrderUpdate }) {
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const q = `branchId=${branchId}`;
  const { data: discounts = [] } = useGetDiscountsQuery(q, { skip: !branchId });
  const [applyDiscount, { isLoading }] = useApplyDiscountMutation();
  const [removeDiscount, { isLoading: isRemoving }] = useRemoveDiscountMutation();
console.log("current order:", currentOrder);
  // State for applied discount details
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Pre-load applied discount if order has one
  useEffect(() => {
    if (currentOrder?.appliedDiscount) {
      setAppliedDiscount(currentOrder.appliedDiscount);
    }
  }, [currentOrder]);

  const handleApply = async () => {
    if (!selectedDiscount && !couponCode.trim()) {
      toast.error("Please select a discount or enter a coupon code");
      return;
    }
    try {
      const body = { orderId, discountId: selectedDiscount || null, couponCode: couponCode || null };
      const res = await applyDiscount(body).unwrap();
      toast.success(res.message);

      // Update local order state with new totals and applied discount
      if (onOrderUpdate && res.order) {
        onOrderUpdate(res.order);
        setAppliedDiscount(res.order.appliedDiscount);
      }

      // Reset inputs
      setSelectedDiscount("");
      setCouponCode("");
    } catch (err) {
      toast.error(err.data?.error || "Failed to apply discount");
    }
  };

  const handleRemoveDiscount = async () => {
    // Optional: Implement remove discount API if needed (e.g., set appliedDiscount to null)'
    try {
      const body = { orderId };
      const res = await removeDiscount(body).unwrap();
      toast.success(res?.message || "Discount removed");
    // For now, just reset local state and notify
    setAppliedDiscount(null);
    if (onOrderUpdate) {
      const updatedOrder = { ...currentOrder, appliedDiscount: null, total: currentOrder.subtotal + currentOrder.tax }; // Recalculate without discount
      onOrderUpdate(updatedOrder);
    }
    } catch (err) {
      toast.error(err.data?.error || "Failed to remove discount");
    }
  };

  const handleSelectChange = (e) => {
    setSelectedDiscount(e.target.value);  
    setCouponCode("");
  }

  const handleInputChange = (e) => {
    setCouponCode(e.target.value);
    setSelectedDiscount("");
  }

  const originalTotal = currentOrder ? (currentOrder.subtotal) : 0;
  const discountedTotal = appliedDiscount ? (originalTotal - appliedDiscount.discountAmount) : originalTotal;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-blue-600" />
        Apply Discount
      </h3>

      {/* Apply Discount Form */}
      {!appliedDiscount && (
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Discount</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={selectedDiscount}
                onChange={handleSelectChange}
              >
                <option value="">Choose a discount</option>
                {discounts.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.discountType === "percentage" ? `${d.value}%` : `₹${d.value}`})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Or Enter Coupon Code</label>
              <input
                type="text"
                placeholder="e.g., SAVE10"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={selectedDiscount !== ""}
              />
            </div>
          </div>
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Applying..." : "Apply Discount"}
          </button>
        </div>
      )}

      {/* Applied Discount Details */}
      {appliedDiscount && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Discount Applied</span>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition"
              title="Remove Discount"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Name:</strong> {appliedDiscount.discountName}</p>
            <p><strong>Type:</strong> {appliedDiscount.discountType} ({appliedDiscount.discountValue}{appliedDiscount.discountType === "percentage" ? "%" : "₹"})</p>
            <p><strong>Amount Saved:</strong> ₹{appliedDiscount.discountAmount.toFixed(2)}</p>
            <hr className="border-gray-300" />
            <div className="flex justify-between font-semibold">
              <span>Original Total:</span>
              <span>₹{originalTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-green-600">
              <span>New Total:</span>
              <span>₹{discountedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* No Discounts Available */}
      {discounts.length === 0 && !appliedDiscount && (
        <p className="text-gray-500 text-sm">No discounts available for this branch.</p>
      )}
    </div>
  );
}