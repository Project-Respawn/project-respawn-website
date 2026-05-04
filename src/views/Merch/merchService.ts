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

if (!API_BASE) {
  console.warn('Missing projectRespawnApi endpoint in amplify_outputs.json. Merch functionality will not work until backend is deployed.');
}

function getJsonHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

async function parseResponse(response: Response, errorPrefix: string) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorPrefix}: ${response.status} ${errorText}`);
  }

  return response.json();
}
