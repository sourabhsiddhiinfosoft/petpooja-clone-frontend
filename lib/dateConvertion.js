export function formatDateToDDMMYY(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year

  return `${day}-${month}-${year}`;
}

