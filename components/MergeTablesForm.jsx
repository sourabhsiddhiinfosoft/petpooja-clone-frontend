"use client";
import { useState, useEffect } from 'react';
import { useGetAreasWithTablesQuery } from '../store/api/ownerApi'; // Adjust path if needed
import { useCurrentBranch } from '../store/hooks/useCurrentBranch';

export default function MergeTablesForm({ onSubmit, loading }) {
  const { currentBranch, branches, user } = useCurrentBranch();
  const branchId = user?.branchId || "";
  
  const { data: awt = [], isLoading: isLoadingTables, refetch: refetchAreasWithTables } = useGetAreasWithTablesQuery(branchId, { skip: !branchId });
  
  const [primaryTable, setPrimaryTable] = useState('');
  const [secondaryTables, setSecondaryTables] = useState([]);

  // Flatten and filter only occupied tables from the API response
  const occupiedTables = awt?.data?.flatMap(area => 
    area.tables.filter(table => table.status === 'occupied')
  ) || [];

  // Group occupied tables by area.name
  const groupedTables = occupiedTables.reduce((acc, table) => {
    // Find the area name from the parent data
    const area = awt?.data?.find(a => a._id === table.area?._id || a.tables.some(t => t._id === table._id));
    const areaName = area?.name || 'Unknown Area';
    if (!acc[areaName]) acc[areaName] = [];
    acc[areaName].push(table);
    return acc;
  }, {});

  const handlePrimaryChange = (tableId) => {
    setPrimaryTable(tableId);
    // Remove from secondary if selected as primary
    setSecondaryTables(prev => prev.filter(id => id !== tableId));
  };

  const handleSecondaryChange = (tableId, checked) => {
    if (checked) {
      setSecondaryTables(prev => [...prev, tableId]);
    } else {
      setSecondaryTables(prev => prev.filter(id => id !== tableId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!primaryTable || secondaryTables.length === 0) {
      alert('Please select a primary table and at least one secondary table.');
      return;
    }
    onSubmit({ primaryTableId: primaryTable, secondaryTableIds: secondaryTables });
  };

  if (isLoadingTables) return <div className="text-center py-4">Loading tables...</div>;
  if (!awt?.success || occupiedTables.length === 0) return <div className="text-center py-4 text-gray-500">No occupied tables available for merging.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Select Primary Table (Main Bill)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occupiedTables.map(table => (
            <div
              key={table._id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                primaryTable === table._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handlePrimaryChange(table._id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{table.name}</span>
                <input
                  type="radio"
                  name="primary"
                  value={table._id}
                  checked={primaryTable === table._id}
                  onChange={() => handlePrimaryChange(table._id)}
                  className="w-4 h-4 text-blue-600"
                />
              </div>
              <p className="text-sm text-gray-600">Seats: {table.seats}</p>
              <p className="text-sm text-gray-600">Order Total: ₹{table.currentOrder?.total || 0}</p>
              <p className="text-sm text-gray-600">Items: {table.currentOrder?.itemsCount || 0}</p>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                table.currentOrder?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                table.currentOrder?.status === 'preparing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {table.currentOrder?.status || 'Occupied'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Select Secondary Tables to Merge</h3>
        {Object.keys(groupedTables).map(areaName => (
          <div key={areaName} className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">{areaName}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedTables[areaName].map(table => (
                <div
                  key={table._id}
                  className={`border rounded-lg p-4 transition-all ${
                    secondaryTables.includes(table._id) ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  } ${table._id === primaryTable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300'}`}
                  onClick={() => table._id !== primaryTable && handleSecondaryChange(table._id, !secondaryTables.includes(table._id))}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{table.name}</span>
                    <input
                      type="checkbox"
                      value={table._id}
                      checked={secondaryTables.includes(table._id)}
                      onChange={(e) => handleSecondaryChange(table._id, e.target.checked)}
                      disabled={table._id === primaryTable}
                      className="w-4 h-4 text-green-600"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Seats: {table.seats}</p>
                  <p className="text-sm text-gray-600">Order Total: ₹{table.currentOrder?.total || 0}</p>
                  <p className="text-sm text-gray-600">Items: {table.currentOrder?.itemsCount || 0}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    table.currentOrder?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    table.currentOrder?.status === 'preparing' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {table.currentOrder?.status || 'Occupied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={loading || !primaryTable || secondaryTables.length === 0}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Merging Tables...' : 'Merge Tables'}
        </button>
      </div>
    </form>
  );
}
