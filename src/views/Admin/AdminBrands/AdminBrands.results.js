export function requireSuccessfulBrandMutation(result, fallbackMessage) {
  const graphQlMessage = result?.errors?.[0]?.message;
  if (graphQlMessage) throw new Error(graphQlMessage);

  if (result?.data?.success !== true) {
    throw new Error(result?.data?.message || fallbackMessage);
  }

  return result.data;
}

export function assertCreatedBrandVisible(brands, brandId) {
  if (!brandId || !brands.some((brand) => brand.id === brandId)) {
    throw new Error('The Brand was created but could not be found in Existing Brands. Please reload and try again.');
  }
}

export async function listAllBrands(client) {
  const brands = [];
  let nextToken;

  do {
    const options = {
      authMode: 'userPool',
      limit: 1000,
    };
    if (typeof nextToken === 'string' && nextToken) options.nextToken = nextToken;
    const { data, errors, nextToken: receivedNextToken } = await client.models.Brand.list(options);
    if (errors?.length) throw new Error(errors[0].message || 'Failed to load brands.');
    brands.push(...(data || []));
    nextToken = receivedNextToken;
  } while (nextToken);

  return brands;
}

export function normalizeOwnerUsers(value) {
  const users = Array.isArray(value) ? value : [];
  return users
    .map((user) => {
      const userId = user?.username || user?.id || '';
      if (!userId) return null;
      const name = user?.name || userId;
      const email = user?.email || '';
      return { userId, label: email ? `${name} — ${email}` : `${name} — ${userId}` };
    })
    .filter(Boolean)
    .sort((left, right) => left.label.localeCompare(right.label));
}
