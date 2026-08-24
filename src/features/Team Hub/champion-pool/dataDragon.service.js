// src/features/team-hub/champion-pool/dataDragon.service.js

const VERSIONS_URL =
  'https://ddragon.leagueoflegends.com/api/versions.json';

const CACHE_KEY = 'respawn:data-dragon:champions';
const CACHE_VERSION_KEY = 'respawn:data-dragon:version';

async function requestJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Data Dragon request failed: ${response.status}`);
  }

  return response.json();
}

export async function loadChampionCatalogue() {
  try {
    const versions = await requestJson(VERSIONS_URL);
    const version = versions[0];

    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    const cachedCatalogue = localStorage.getItem(CACHE_KEY);

    if (cachedVersion === version && cachedCatalogue) {
      return {
        version,
        champions: JSON.parse(cachedCatalogue),
      };
    }

    const catalogueUrl =
      `https://ddragon.leagueoflegends.com/cdn/${version}` +
      '/data/en_GB/champion.json';

    const result = await requestJson(catalogueUrl);

    const champions = Object.values(result.data)
      .map((champion) => ({
        id: champion.id,
        key: champion.key,
        name: champion.name,
        title: champion.title,
        tags: champion.tags ?? [],
        imageFile: champion.image.full,
      }))
      .sort((first, second) =>
        first.name.localeCompare(second.name),
      );

    localStorage.setItem(CACHE_VERSION_KEY, version);
    localStorage.setItem(CACHE_KEY, JSON.stringify(champions));

    return {
      version,
      champions,
    };
  } catch (error) {
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    const cachedCatalogue = localStorage.getItem(CACHE_KEY);

    if (cachedVersion && cachedCatalogue) {
      return {
        version: cachedVersion,
        champions: JSON.parse(cachedCatalogue),
        usingCachedData: true,
      };
    }

    throw error;
  }
}

export function championImageUrl(version, champion) {
  return (
    `https://ddragon.leagueoflegends.com/cdn/${version}` +
    `/img/champion/${champion.imageFile}`
  );
}