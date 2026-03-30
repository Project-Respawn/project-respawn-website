const manualProducts = require("./manual-products");

exports.handler = async function () {
  try {
    const printfulProducts = await fetchPrintfulProducts();
    return jsonResponse(200, [...manualProducts, ...printfulProducts]);
  } catch (error) {
    console.error("Products function error:", error);
    return jsonResponse(200, manualProducts);
  }
};

async function fetchPrintfulProducts() {
  const apiKey = process.env.PRINTFUL_API_KEY;

  if (!apiKey) {
    return [];
  }

  const response = await fetch("https://api.printful.com/store/products", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Printful API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.result) ? data.result : [];

  return items.map((item) => ({
    id: `printful-${item.id}`,
    title: item.name || "Printful Product",
    description: item.sync_product?.name || "Printful product",
    price: Number(item.retail_price || 0),
    image: item.thumbnail_url || "https://via.placeholder.com/800?text=Printful+Product",
    source: "printful",
    checkoutUrl: `/checkout.html?product=printful-${item.id}`,
    productUrl: `/product/printful-${item.id}`,
    externalId: item.id
  }));
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}
