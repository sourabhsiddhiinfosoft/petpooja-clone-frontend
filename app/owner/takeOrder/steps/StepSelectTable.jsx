import { useGetAreasWithTablesQuery } from "../../../../store/api/ownerApi";


export default function StepSelectTable({ branchId, onSelect }) {
  const { data, isLoading } = useGetAreasWithTablesQuery(branchId);
  if (isLoading) return <p>Loading tables...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select Table</h2>
      {data?.data?.map((area) => (
        <div key={area._id} className="mb-6">
          <h3 className="text-md font-semibold mb-2">{area.name}</h3>
          <div className="grid grid-cols-4 gap-3">
            {area.tables.map((table) => (
              <button
                key={table._id}
                onClick={() => onSelect(table)}
                className="border rounded-lg p-3 hover:bg-green-100 transition"
              >
                {table.name}
                <div className="text-xs text-gray-500">{table.status}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
