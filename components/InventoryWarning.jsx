"use client";
import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useGetInventoryQuery } from '../store/api/ownerApi';

export default function InventoryWarning({ menuItem, onClose }) {
  const [showWarning, setShowWarning] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);

  // Get inventory data
  const { data: inventoryData = [] } = useGetInventoryQuery();

  useEffect(() => {
    if (!menuItem || !inventoryData.length) return;

    // Check if this menu item has inventory dependencies
    // This would typically come from a recipe/BOM system
    // For now, we'll simulate with a simple name matching
    const checkInventoryStatus = () => {
      const lowStock = [];
      const outOfStock = [];

      // Simple name matching - in real app, this would be based on recipe/BOM
      const itemName = menuItem.name.toLowerCase();
      
      inventoryData.forEach(inventoryItem => {
        const inventoryName = inventoryItem.name.toLowerCase();
        
        // Check if menu item name contains inventory item name or vice versa
        if (itemName.includes(inventoryName) || inventoryName.includes(itemName)) {
          if (inventoryItem.currentQuantity === 0) {
            outOfStock.push(inventoryItem);
          } else if (inventoryItem.currentQuantity <= inventoryItem.minQuantity) {
            lowStock.push(inventoryItem);
          }
        }
      });

      setLowStockItems(lowStock);
      setOutOfStockItems(outOfStock);
      setShowWarning(lowStock.length > 0 || outOfStock.length > 0);
    };

    checkInventoryStatus();
  }, [menuItem, inventoryData]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Warning</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">
              Adding <strong>{menuItem.name}</strong> may be affected by inventory levels:
            </p>

            {/* Out of Stock Items */}
            {outOfStockItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Out of Stock</h4>
                </div>
                <ul className="space-y-1">
                  {outOfStockItems.map((item) => (
                    <li key={item._id} className="text-sm text-red-700">
                      • {item.name} - {item.currentQuantity} {item.unit} remaining
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Low Stock</h4>
                </div>
                <ul className="space-y-1">
                  {lowStockItems.map((item) => (
                    <li key={item._id} className="text-sm text-yellow-700">
                      • {item.name} - {item.currentQuantity} {item.unit} remaining (min: {item.minQuantity})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Proceed with adding to cart despite warnings
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Add Anyway
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
