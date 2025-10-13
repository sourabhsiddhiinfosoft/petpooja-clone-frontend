import { useState } from "react";
import { useGetCategoriesQuery, useGetMenuQuery } from "../../../../store/api/ownerApi";


export default function StepSelectMenu({
    categories,
    menus,
  cartItems,
  setCartItems,
  onNext,
  onBack,
}) {

  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredMenus = selectedCategory
    ? menus?.filter((m) => m.categoryId === selectedCategory._id)
    : menus;

  const handleAdd = (menu) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === menu._id);
      if (existing) {
        return prev.map((i) =>
          i._id === menu._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...menu, qty: 1 }];
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <h2 className="text-xl font-semibold">Select Menu Items</h2>
        <button onClick={onNext} className="btn-primary">Next →</button>
      </div>

      <div className="flex gap-4">
        <div className="w-1/4 border-r">
          <h3 className="font-semibold mb-2">Categories</h3>
          {categories?.map((cat) => (
            <div
              key={cat._id}
              onClick={() => setSelectedCategory(cat)}
              className={`p-2 cursor-pointer rounded ${selectedCategory?._id === cat._id ? "bg-green-200" : "hover:bg-gray-100"}`}
            >
              {cat.name}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-3 gap-3">
          {filteredMenus?.map((menu) => (
            <div
              key={menu._id}
              className="border rounded-lg p-3 flex flex-col justify-between hover:shadow-md"
            >
              <h4 className="font-semibold">{menu.name}</h4>
              <p>₹{menu.price}</p>
              <button onClick={() => handleAdd(menu)} className="btn-primary mt-2">
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
