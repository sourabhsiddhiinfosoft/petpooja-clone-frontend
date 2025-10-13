import { useCreateOrderMutation, useGetKOTQuery } from "../../../../store/api/ownerApi";


export default function StepCartKOT({ restaurantId, branchId, selectedTable, cartItems, setCartItems, onBack }) {
  const [createOrder] = useCreateOrderMutation();
  const { data: kotList } = useGetKOTQuery({ restaurantId, branchId });

  const handleCreateOrder = async () => {
    const res = await createOrder({
      restaurantId,
      branchId,
      tableId: selectedTable._id,
      items: cartItems.map((i) => ({
        menuItem: i._id,
        qty: i.qty,
      })),
    });
    if (res.data) alert("Order created successfully!");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <h2 className="text-xl font-semibold">Cart & KOT Management</h2>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Selected Table: {selectedTable?.name}</h3>
        <div className="border p-4 rounded-lg bg-white shadow">
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>{item.name}</span>
              <span>₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-3 font-semibold">
          <span>Total</span>
          <span>₹{cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleCreateOrder} className="btn-primary">Create New KOT</button>
        <button className="btn-secondary">Print KOT</button>
        <button className="btn-success">Proceed to Payment</button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Existing KOTs</h3>
        {kotList?.length ? (
          kotList.map((kot) => (
            <div key={kot._id} className="border p-2 rounded mb-2">
              <div className="flex justify-between">
                <span>KOT #{kot._id.slice(-5)}</span>
                <span>Status: {kot.status}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No KOTs yet.</p>
        )}
      </div>
    </div>
  );
}
