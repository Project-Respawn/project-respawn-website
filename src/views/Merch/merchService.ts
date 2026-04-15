const API_URL = "https://raven-api-nine.vercel.app/api/products";

export type PrintfulVariantFile = {
  preview_url?: string;
};

export type PrintfulSyncVariant = {
  id: string | number;
  name?: string;
  retail_price?: string | number;
  files?: PrintfulVariantFile[];
};

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  source: string;
  price: number;
  checkoutUrl?: string;
  productUrl?: string;
  variants?: PrintfulSyncVariant[];
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();

  //console.log("RAW API RESPONSE:", data);

  const products: Product[] = (data.result || []).map((item: any) => {
    const firstVariant = item.variants?.[0];

    return {
      id: String(item.id),
      title: item.name,
      description: item.description || "",
      image: item.thumbnail_url,
      source: "printful",
      price: firstVariant?.retail_price ? Number(firstVariant.retail_price) : 0,
      variants: Array.isArray(item.variants) ? item.variants : [],

      // connect checkout page
      checkoutUrl: `/checkout?productId=${item.id}`,

      productUrl: item.url || "",
    };
  });

  // console.log("NORMALIZED PRODUCTS:", products);

  return products;
}
