"use client";
import { useState } from "react";
import StepSelectTable from "./steps/StepSelectTable";
import StepSelectMenu from "./steps/StepSelectMenu";
import StepCartKOT from "./steps/StepCartKOT";
import { useCurrentBranch } from "../../../store/hooks/useCurrentBranch";
import { useGetCategoriesQuery, useGetMenuQuery } from "../../../store/api/ownerApi";
import DashboardLayout from "../../../components/DashboardLayout";

export default function TakeOrderFlow() {
    const { currentBranch, branches, user } = useCurrentBranch();
    const restaurantId = user?.restaurantId || "";
    const branchId = currentBranch?._id || "";

    // Build query params
    let q = "";
    if (restaurantId) q += `restaurantId=${restaurantId}`;
    if (branchId) q += `${q ? "&" : ""}branchId=${branchId}`;

    const { data: categories } = useGetCategoriesQuery(q, { skip: !restaurantId });
    const { data: menus } = useGetMenuQuery(q, { skip: !restaurantId });

    const [step, setStep] = useState(1);
    const [selectedTable, setSelectedTable] = useState(null);
    const [cartItems, setCartItems] = useState([]);

    const goNext = () => setStep((prev) => prev + 1);
    const goBack = () => setStep((prev) => prev - 1);

    return (
           <DashboardLayout userType="owner">
        <div className="flex h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Main Section */}
            <div className="flex-1 p-4 overflow-y-auto">
                {step === 1 && (
                    <StepSelectTable
                        branchId={branchId}
                        onSelect={(table) => {
                            setSelectedTable(table);
                            goNext();
                        }}
                    />
                )}
                {step === 2 && (
                    <StepSelectMenu
                        categories={categories}
                        menus={menus}
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                        onNext={goNext}
                        onBack={goBack}
                    />
                )}
                {step === 3 && (
                    <StepCartKOT
                        restaurantId={restaurantId}
                        branchId={branchId}
                        selectedTable={selectedTable}
                        cartItems={cartItems}
                        setCartItems={setCartItems}
                        onBack={goBack}
                    />
                )}
            </div>

            {/* Sticky Cart Sidebar */}
            <div className="w-[350px] border-l bg-gray-50 p-4 overflow-y-auto">
                <h3 className="font-semibold text-lg mb-2">Cart Summary</h3>
                {cartItems.length === 0 ? (
                    <p>No items added yet.</p>
                ) : (
                    cartItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center mb-2">
                            <span>{item.name}</span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCartItems((prev) => prev.map(p => p._id === item._id ? { ...p, qty: p.qty - 1 } : p))} disabled={item.qty <= 1}>-</button>
                                <span>{item.qty}</span>
                                <button onClick={() => setCartItems((prev) => prev.map(p => p._id === item._id ? { ...p, qty: p.qty + 1 } : p))}>+</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        </DashboardLayout>
    );
}
