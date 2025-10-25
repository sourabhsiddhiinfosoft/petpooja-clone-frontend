"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  PrinterIcon,
  CreditCardIcon,
  UserGroupIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../../components/DashboardLayout';
import { useCurrentBranch } from '../../../store/hooks/useCurrentBranch';
import { useCreateOrderMutation, useGetAreasWithTablesQuery, useUpdateOrderStatusMutation, useAddPaymentMutation, useGetCategoriesQuery, useGetMenuQuery, useUpdateTableMutation, useUpdateOrderMutation } from '../../../store/api/ownerApi';
import { useCreateKOTMutation, useGetKOTQuery, useUpdateKOTStatusMutation } from '../../../store/api/staffApi';
import { printBill } from '../../../lib/printBill';

export default function OrderFlow() {
  const router = useRouter();
  const { currentBranch, branches, user } = useCurrentBranch();
  const restaurantId = user?.restaurantId || '';
  const branchId = currentBranch?._id || '';

  const [step, setStep] = useState(1);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' for default
  const [cart, setCart] = useState([]); // { id, name, price, quantity, modifiers, subtotal }
  const [orderId, setOrderId] = useState(''); // For occupied table pre-load
  const [currentOrder, setCurrentOrder] = useState(null); // For occupied table pre-load
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' }); // Optional customer details

  // APIs
  const { data: awt = [], isLoading: isLoadingTables,refetch: refetchAreasWithTables } = useGetAreasWithTablesQuery(branchId, { skip: !branchId });
  const { data: categories = [] } = useGetCategoriesQuery(`${restaurantId}?branchId=${branchId}`, { skip: !restaurantId });
  const { data: menuItems = [], isLoading: isLoadingMenu } = useGetMenuQuery(`${restaurantId}&branchId=${branchId}&categoryId=${selectedCategory === 'all' ? 0 : selectedCategory}`, { skip: !restaurantId && !selectedCategory });
  const { data: kotData } = useGetKOTQuery(orderId, { skip: !orderId });
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [updateTable] = useUpdateTableMutation();
  const [createKot, { isLoading: isCreatingKOT }] = useCreateKOTMutation();
  const [addPayment, { isLoading: isPaying }] = useAddPaymentMutation();
  const [updateOrderStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [updateKOTStatus] = useUpdateKOTStatusMutation();
  const [updateOrder, { isLoading: isUpdatingOrder }] = useUpdateOrderMutation();

  const areasWithTables = awt?.data

  // Helper: preload cart from an existing order structure
  const preloadCartFromOrder = (order) => {
    if (!order || !Array.isArray(order.items)) return;
    const preloaded = order.items.map((i) => {
      const quantity = i.qty ?? i.quantity ?? 1;
      return {
        id: i.menuItem ?? i.id,
        name: i.name,
        price: i.price,
        quantity,
        subtotal: i.price * quantity,
        modifiers: [],
      };
    });
    setCart(preloaded);
  };

  // Print full customer bill (receipt)
  const handlePrintBill = () => {
    if (!orderId) return toast.error('No order to print');
    const billItems = (currentOrder?.items && currentOrder.items.length > 0)
      ? currentOrder.items
      : cart.map(c => ({ name: c.name, qty: c.quantity, price: c.price }));
    if (!billItems || billItems.length === 0) return toast.error('No items to print');

    printBill({
      orderId,
      items: billItems,
      subtotal,
      tax,
      total: currentOrder?.total ?? total,
      user,
      tableName: selectedTable?.name,
      headerText: 'Test Header',
      footerText: 'Test Footer',
    });
  };

  useEffect(() => {
    if (!selectedTable) return;
    const order = selectedTable?.currentOrder;
    if (order && order._id) {
      setOrderId(order._id);
      setCurrentOrder(order);
      // preloadCartFromOrder(order);
      setStep(3); // Jump straight to Cart when there is an existing order (occupied)
    }
  }, [selectedTable])

  // Cart calculations
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const tax = subtotal * 0;
  const total = subtotal + tax;

  // Add to cart
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item._id);
    if (existing) {
      setCart(cart.map(c => c.id === item._id ? { ...c, quantity: c.quantity + 1, subtotal: (c.price * (c.quantity + 1)) } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1, subtotal: item.price, modifiers: [] }]);
    }
    toast.success(`${item.name} added to cart`);
  };

  // Update quantity
  const updateQuantity = (id, delta) => {
    setCart(cart.map(c => {
      if (c.id === id) {
        const newQty = Math.max(0, c.quantity + delta);
        return newQty > 0 ? { ...c, quantity: newQty, subtotal: c.price * newQty } : null;
      }
      return c;
    }).filter(Boolean));
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
    toast('Item removed');
  };

  // Add modifier (simple example)
  const addModifier = (itemId, modifier) => {
    setCart(cart.map(c => c.id === itemId ? { ...c, modifiers: [...c.modifiers, modifier] } : c));
  };

  // Step navigation
  const nextStep = () => setStep(Math.min(step + 1, 3));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const handleCreateKOT = async () => {
    if (cart.length === 0) {
      return toast.error('Cart is empty');
    }
    if (!orderId) {
      return toast.error('Create order first to generate KOT');
    }
    try {
      const kotPayload = {
        orderId,
        tableId: selectedTable._id,
        items: cart.map(item => ({ ...item, modifiers: item.modifiers })),
        total,
      };
      await createKot(kotPayload).unwrap();
      toast.success('KOT created successfully!');
      // Invalidate queries to refetch updated KOT
      // (Assumes RTK Query tags like ['KOT'] are set)
    } catch (error) {
      toast.error('Failed to create KOT');
    }
  }

  // Create order and update table
  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    try {
      const orderPayload = {
        restaurantId,
        type: 'dine-in',
        branchId,
        tableId: selectedTable._id,
        items: cart.map(item => ({
          _id: item?._id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
          modifiers: item.modifiers,
        })),
        subtotal,
        tax,
        total,
        status: 'pending',
        orderBy: user._id,
        orderByType: 'Staff',
        // Optional customer details (only include keys with values)
        customer: {
          ...(customer?.name ? { name: customer.name } : {}),
          ...(customer?.phone ? { phone: customer.phone } : {}),
          ...(customer?.address ? { address: customer.address } : {}),
        },
      };
      const response = await createOrder(orderPayload).unwrap();
      setOrderId(response._id);

      // Update table status to occupied
      await updateTable({ _id: selectedTable._id, status: 'occupied' }).unwrap();

      toast.success('Order created successfully!');

      // Invalidate queries to refetch updated tables
      // (Assumes RTK Query tags like ['Tables'] are set)

      // Stay in the same flow; jump to cart step to allow KOT/print
      setCart([])
      refetchAreasWithTables();
      setStep(1);
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  //handle update menu items on the order 
  const handleUpdateOrder = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!orderId) {
      toast.error('No order to update');
      return;
    }
    try {
      const body = {
        items: cart.map(item => ({
          _id: item?._id,
          name: item.name,
          qty: item.quantity,
          price: item.price,
          modifiers: item.modifiers,
        })),
        subtotal,
        tax,
        total,
      };
      const updated = await updateOrder({ orderId, body }).unwrap();
      // Optionally sync local current order state
      setCurrentOrder(prev => ({ ...(prev || {}), ...(updated || {}), items: body.items, subtotal: body.subtotal, tax: body.tax, total: body.total }));
      toast.success('Order updated successfully');
         window.refresh();
    } catch (error) {
      toast.error('Failed to update order');
    }
  }


  // Print KOT (simple demo; integrate with print lib)
  const handlePrintKOT = () => {
    if(!cart || cart.length === 0) return toast.error('No items in cart to print KOT');
    const kotItems = kotData?.items || cart;
    const printContent = `
      KOT for Order #${orderId}
      Table: ${selectedTable?.name}
      Items: ${kotItems.map(i => `${i.name} x${i.quantity}`).join('\n')}
      Total: ₹${total.toFixed(2)}
    `;
    // Use window.print() or react-to-print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre>${printContent}</pre>`);
    printWindow.document.close();
    printWindow.print();
    toast.success('KOT printed');
  };

  // Cancel a KOT ticket
  const handleCancelKOT = async (kotId) => {
    if (!kotId) return;
    try {
      await updateKOTStatus({ id: kotId, status: 'cancelled' }).unwrap();
      toast.success('KOT cancelled');
    } catch (e) {
      toast.error('Failed to cancel KOT');
    }
  };

  // Take cash payment and complete order
  const handleTakeCashPayment = async () => {
    if (!orderId || !selectedTable) return toast.error('No order selected');
    try {
      await addPayment({ id: orderId, method: 'cash', amount: total, status: 'paid' }).unwrap();
      await updateOrderStatus({ id: orderId, status: 'completed' }).unwrap();
      await updateTable({ _id: selectedTable._id, status: 'available' }).unwrap();
      toast.success('Payment recorded. Order completed. Table is now available.');
      setCart([]);
      setOrderId('');
      setCurrentOrder(null);
      setSelectedTable(null);
      setStep(1);
      refetchAreasWithTables();
    } catch (e) {
      console.error(e);
      // toast.error('Payment failed to record');
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      occupied: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      'out-of-service': 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold capitalize ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const existingOrderDate = (createdAt) => {
    const date = new Date(createdAt);
    const year = date.toLocaleString('en-US', { year: 'numeric' });
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.toLocaleString('en-US', { day: '2-digit' });

    const customFormattedDate = `${day}-${month}-${year}`;
    return customFormattedDate;
  }

  // Step 1: Table Selection
  if (step === 1) {
    return (
      <DashboardLayout userType="owner">
        <div className="min-h-screen bg-gray-50 py-1" >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              {step > 1 &&
                <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                  <ChevronLeftIcon className="h-5 w-5" /> Back to Tables
                </button>

              }
              <h1 className="text-xl font-bold text-gray-900">Select Table</h1>
              <div className="w-32" /> {/* Spacer */}
            </div>

            {/* Stepper */}
            <div className="mb-8 flex justify-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <UserGroupIcon className="h-5 w-5" />
                  <span>1. Table</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <MapPinIcon className="h-5 w-5" />
                  <span>2. Menu</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <CreditCardIcon className="h-5 w-5" />
                  <span>3. Cart</span>
                </div>
              </div>
            </div>

            {/* Areas & Tables */}
            <div className="space-y-6">
              {isLoadingTables && (
                <div key={"loading-carddd"} className="bg-white rounded-xl shadow-sm border border-gray-200">
                 <div
                    className="p-4 cursor-pointer hover:bg-gray-50 rounded-t-xl flex justify-between items-center"
                  
                  >
                    <h2 className="text-xl font-semibold text-gray-900">Loading areas...</h2>
                    <span className="text-sm text-gray-500">Tables: --</span>
                  </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="p-4 rounded-lg border-2 bg-gray-50 animate-pulse">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-full" />
                      <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-1" />
                      <div className="h-2 bg-gray-200 rounded w-10 mx-auto" />
                    </div>
                  ))}
                </div>
                </div>
              )}
              {areasWithTables && areasWithTables?.map((area) => (
                <div key={area._id} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 rounded-t-xl flex justify-between items-center"
                    onClick={() => { }} // Collapsible if needed
                  >
                    <h2 className="text-xl font-semibold text-gray-900">{area.name}</h2>
                    <span className="text-sm text-gray-500">Tables: {area.tablesCount}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
                    {area.tables.map((table) => (
                      <button
                        key={table._id}
                        onClick={() => {
                          setSelectedTable(table);
                          // If table is occupied and has a current order, go to Cart directly
                          if (table.status === 'occupied' && table.currentOrder && table.currentOrder._id) {
                            setOrderId(table.currentOrder._id);
                            setCurrentOrder(table.currentOrder);
                            // preloadCartFromOrder(table.currentOrder);
                            setStep(3);
                          } else {
                            // Fresh table flow → go to Menu selection
                            setStep(2);
                          }
                        }}
                        className={`p-4 rounded-lg border-2 transition-all ${selectedTable?._id === table._id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : table.status === 'occupied'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        disabled={table.status === 'reserved'} // Optional
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{table.name}</span>
                          </div>
                          <p className="text-sm font-medium">{table.name}</p>
                          <p className="text-xs text-gray-500">{table.seats} seats</p>
                          {table.status === 'occupied' && (
                            <p className="text-xs text-red-600 mt-1">Occupied</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* No Tables */}
            {areasWithTables && areasWithTables?.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tables available</h3>
                <p className="text-gray-500">Add tables in the Tables section.</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Step 2: Categories & Menus
  if (step === 2) {
    return (
      <DashboardLayout userType="owner">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <button onClick={prevStep} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                <ChevronLeftIcon className="h-5 w-5" /> Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Select Menu Items</h1>
              <div className="w-32" />
            </div>

            {/* Stepper (copy from Step 1) */}
            <div className="mb-8 flex justify-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <UserGroupIcon className="h-5 w-5" />
                  <span>1. Table</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <MapPinIcon className="h-5 w-5" />
                  <span>2. Menu</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                <div onClick={() => { if ((currentOrder && currentOrder?._id)) { return setStep(3) } }} className={`flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-full ${(step >= 3) || (currentOrder) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <CreditCardIcon className="h-5 w-5" />
                  <span>3. Cart</span>
                </div>
              </div>
            </div>

            {/* Layout: Categories Left, Menus Right, Cart Bottom/Sticky */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Categories */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[calc(100vh-200px)] overflow-y-auto">
                <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-blue-600" />
                  Categories
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    All Items
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${selectedCategory === cat._id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: Menus Grid */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 xs:mb-6 lg:mb-0 h-[calc(100vh-200px)] overflow-y-auto">
                <h3 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  Menu Items ({menuItems.length})
                </h3>
                {isLoadingMenu && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100 animate-pulse">
                        <div className="w-full h-32 bg-gray-200 rounded-lg mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-24 mb-2" />
                        <div className="h-2 bg-gray-200 rounded w-32 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4  gap-4">
                  {menuItems.map((item) => {
                    const cartItem = cart.find(c => c.id === item._id);
                    return (
                      <div key={item._id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all border border-gray-100">
                        <img
                          src={item?.image || '/images/No-Image-Placeholder.png'}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{item.description || 'Delicious item'}</p>
                        <p className="text-lg font-bold text-green-600 mb-3">₹{item.price}</p>

                        {/* Quantity Controls if in Cart */}
                        {cartItem ? (
                          <div className="flex items-center justify-center gap-2 bg-white rounded-lg p-2 border">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="p-1 text-gray-500 hover:text-red-500"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="font-semibold px-3">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="p-1 text-gray-500 hover:text-green-500"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                          >
                            + Add
                          </button>
                        )}

                        {/* Simple Modifiers Example (show if in cart) */}
                        {cartItem && (
                          <select
                            onChange={(e) => addModifier(item._id, { name: e.target.value, price: 10 })}
                            className="w-full mt-2 p-1 text-xs border rounded text-gray-700"
                            defaultValue=""
                          >
                            <option value="">Add-ons (+₹10)</option>
                            <option value="Extra Cheese">Extra Cheese</option>
                            <option value="Spicy Sauce">Spicy Sauce</option>
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* No Menu Items */}
                {menuItems.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items available</h3>
                    <p className="text-gray-500">Add menu items in the Menu section.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Cart Preview Bottom (Mobile + Desktop) */}
            {cart.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 lg:static lg:ml-0 bg-white border-t border-gray-200 lg:border-t-0 lg:rounded-xl lg:shadow-sm lg:mt-6 p-4 lg:p-0 lg:pt-4">
                <div className="flex flex-wrap items-center justify-between lg:p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{cart.length}</span>
                    </div>
                    <span className="font-semibold text-gray-900">Cart: {cart.length} items</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Subtotal: ₹{subtotal.toFixed(2)}</p>
                    <p className="font-bold text-lg text-green-600">Total: ₹{total.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={nextStep}
                    disabled={cart.length === 0}
                    className="ml-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
                  >
                    Review Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Step 3: Cart & KOT Management
  if (step === 3) {
    return (
      <DashboardLayout userType="owner">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <button onClick={prevStep} className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                <ChevronLeftIcon className="h-5 w-5" /> Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Cart & Order Summary</h1>
              <div className="w-32" />
            </div>

            {/* Stepper (copy from Step 1) */}
            <div className="mb-8 flex justify-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 1 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <UserGroupIcon className="h-5 w-5" />
                  <span>1. Table</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                  <MapPinIcon className="h-5 w-5" />
                  <span>2. Menu</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${step >= 3 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  <CreditCardIcon className="h-5 w-5" />
                  <span>3. Cart</span>
                </div>
              </div>
            </div>

            {/* Table Info */}
            {selectedTable && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-blue-600" />
                  Selected Table
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{selectedTable.name}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedTable.name}</p>
                    <p className="text-sm text-gray-600">{selectedTable.seats} seats • {selectedTable.area?.name || 'N/A'}</p>
                    {selectedTable.status === 'occupied' && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        Occupied - Existing Order Loaded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Existing Order Section (if preloaded) */}
            {currentOrder && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Existing Order</h3>
                <div className="text-sm text-gray-600 mb-4">
                  <div>Order ID: <span className="font-medium text-gray-900">{orderId}</span></div>
                  <div>Status: <span className="font-medium capitalize">{currentOrder.status}</span></div>
                  {/* <div>Created: {new Date(currentOrder.createdAt).toLocaleString()}</div> */}
                  <div>Order Date: {existingOrderDate(currentOrder.createdAt)}</div>
                </div>
                <ul className="divide-y">
                  {(currentOrder.items || []).map((i, idx) => (
                    <li key={idx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{i.name}</div>
                          <div className="text-xs text-gray-500">Qty: {i.qty} • ₹{i.price}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">₹{(i.price * i.qty).toFixed(2)}</div>
                    </li>
                  ))}
                </ul>

                {/* KOT List & Cancel */}
                {Array.isArray(currentOrder.kotIds) && currentOrder.kotIds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">KOTs</h4>
                    <div className="space-y-2">
                      {currentOrder.kotIds.map((k) => (
                        <div key={k} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="text-sm">KOT: {k}</div>
                          <button
                            onClick={() => handleCancelKOT(k)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Cancel KOT
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <hr className="border-t border-gray-300 my-4"></hr>
                <div className="text-right">
                  {/* <p className="text-sm text-gray-600">Subtotal: ₹{subtotal.toFixed(2)}</p> */}
                  <p className="font-bold text-lg text-green-600">Total: ₹{currentOrder?.total.toFixed(2)}</p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={handlePrintBill}
                    disabled={!orderId}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PrinterIcon className="h-5 w-5" />
                    Print Bill
                  </button>
                  <button
                    onClick={handleTakeCashPayment}
                    disabled={isPaying || isUpdatingStatus}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed col-span-1 sm:col-span-2 lg:col-span-1"
                  >
                    <CreditCardIcon className="h-5 w-5" />
                    Take Cash & Complete
                  </button>
                </div>
              </div>
            )}

            {/* Cart Items List (Add more) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCardIcon className="h-5 w-5 text-green-600" />
                {currentOrder ? 'Add More Items' : `Cart Items (${cart.length})`}
              </h3>
              {/* Optional Customer Details */}
              {!currentOrder && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name (optional)</label>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="9876543210"
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
                    <input
                      type="text"
                      value={customer.address}
                      onChange={(e) => setCustomer((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="Apartment, Street, City"
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                </div>
              )}
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <TrashIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{currentOrder ? 'Cart empty. Add more from menu.' : 'Your cart is empty. Add items from the menu.'}</p>
                  <button
                    onClick={() => setStep(2)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Go to Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={item.imageUrl || '/images/No-Image-Placeholder.png'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                          {item.modifiers.length > 0 && (
                            <p className="text-xs text-gray-500 mt-1">Add-ons: {item.modifiers.map(m => m.name).join(', ')}</p>
                          )}
                          <p className="text-sm text-gray-600">₹{item.price} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="font-semibold min-w-[20px] text-center px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 text-gray-500 hover:text-green-500 rounded-full hover:bg-green-50 transition"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="font-bold text-green-600 min-w-[60px]">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition"
                          title="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals & KOT Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PrinterIcon className="h-5 w-5 text-yellow-600" />
                Order Summary & KOT
              </h3>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* KOT / Payment Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={handleCreateKOT}
                  disabled={isCreatingKOT}
                  className={`flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md ${isCreatingKOT ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <PrinterIcon className="h-5 w-5" />
                  {isCreatingKOT ? 'Creating KOT...' : 'New KOT'}
                </button>
                <button
                  onClick={handlePrintKOT}
                  disabled={!orderId && cart.length === 0}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PrinterIcon className="h-5 w-5" />
                  Print KOT
                </button>

                <button
                  onClick={() => orderId ? handleUpdateOrder() : handleCreateOrder()}
                  disabled={cart.length === 0 || !selectedTable || isCreatingOrder || isUpdatingOrder}
                  className={`bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex-1 ml-4 ${isCreatingOrder || isUpdatingOrder ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {orderId ? (isUpdatingOrder ? 'Updating...' : 'Update Order') : (isCreatingOrder ? 'Creating...' : 'Create Order')}
                </button>

              </div>

              {/* KOT Preview (if order exists) */}
              {kotData && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">KOT Preview</h4>
                  <pre className="text-sm text-yellow-700 whitespace-pre-wrap">{kotData.summary || 'KOT details here...'}</pre>
                </div>
              )}
            </div>


          </div>

          {/* Fixed Bottom Bar (Mobile Responsive) */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg lg:hidden p-4 z-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{cart.length}</span>
                  </div>
                  <span className="font-semibold text-gray-900">Total: ₹{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => orderId ? handleUpdateOrder() : handleCreateOrder()}
                  disabled={cart.length === 0 || !selectedTable}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex-1 ml-4"
                >
                  {orderId ? 'Update Order' : 'Create Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Fallback (if invalid step)
  return (
    <DashboardLayout userType="owner">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Step</h1>
          <button
            onClick={() => router.push('/owner/tables')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Tables
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
