export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  images: string[];
  source: string;
  price: number;
  variants?: {
    id: string | number;
    name?: string;
    color?: string;
    size?: string;
    price?: number;
    image?: string;
  }[];
}

const API_URL: string =
  import.meta.env.VITE_PRODUCTS_API_URL || "/api/products";

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}
