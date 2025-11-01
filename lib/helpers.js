export function createSlug(name) {
  if (!name) {
    return ''; // Return an empty string if no name is provided
  }

  const slug = name
    .toLowerCase() // Convert the string to lowercase
    .trim() // Remove leading/trailing whitespace
    .normalize('NFD') // Decompose accented characters (e.g., é to e)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace multiple spaces with a single hyphen
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen

  return slug;
}