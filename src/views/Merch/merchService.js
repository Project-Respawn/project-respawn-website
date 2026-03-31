const API_URL =
  import.meta.env.VITE_PRODUCTS_API_URL || "/api/products";

export async function fetchProducts() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}
