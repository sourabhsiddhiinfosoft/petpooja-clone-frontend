export const TableLoading = ({ columns = 5, rows = 5 }) => {
  return (
    <table className="min-w-full text-sm text-gray-700">
      <thead className="bg-gray-100 text-gray-800 sticky top-0">
        <tr>
          {[...Array(columns)].map((_, index) => (
            <th key={index} className="p-3">
              <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-16 mx-auto"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...Array(rows)].map((_, rowIdx) => (
          <tr
            key={`loading-${rowIdx}`}
            className={`${
              rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-blue-50 transition`}
          >
            {[...Array(columns)].map((_, colIdx) => (
              <td key={colIdx} className="p-3">
                <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-16 mx-auto"></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};