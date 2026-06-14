export default async function handler(req: any, res: any) {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY

  if (!PRINTFUL_API_KEY) {
    return res.status(500).json({ error: 'Missing PRINTFUL_API_KEY' })
  }

  try {
    const listResponse = await fetch('https://api.printful.com/store/products', {
      headers: {
        Authorization: `Bearer ${PRINTFUL_API_KEY}`,
      },
    })

    if (!listResponse.ok) {
      return res.status(listResponse.status).json({ error: 'Failed to fetch product list' })
    }

    const listData = await listResponse.json()
    const products = listData.result || []

    const detailedProducts = await Promise.all(
      products.map(async (product: any) => {
        const detailResponse = await fetch(
          `https://api.printful.com/store/products/${product.id}`,
          {
            headers: {
              Authorization: `Bearer ${PRINTFUL_API_KEY}`,
            },
          }
        )

        if (!detailResponse.ok) {
          return null
        }

        const detailData = await detailResponse.json()
        const result = detailData.result

        return {
          id: result.sync_product.id,
          name: result.sync_product.name,
          thumbnailUrl: result.sync_product.thumbnail_url,
          variants: result.sync_variants.map((variant: any) => ({
            id: variant.id,
            name: variant.name,
            retailPrice: variant.retail_price,
            currency: variant.currency,
            size: variant.size,
            color: variant.color,
            availabilityStatus: variant.availability_status,
            sku: variant.sku,
            image:
              variant.product?.image ||
              variant.files?.[0]?.preview_url ||
              result.sync_product.thumbnail_url,
          })),
        }
      })
    )

    return res.status(200).json(detailedProducts.filter(Boolean))
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to fetch merch from Printful',
      details: error.message,
    })
  }
}