const baseUrl = process.env.VITE_API_BASE_URL?.trim();

if (!baseUrl) {
  throw new Error(
    'Build failed: VITE_API_BASE_URL is not set. Set this env var in Amplify staging to the real API Gateway base URL.'
  );
}

if (/<stage>|%3Cstage%3E/i.test(baseUrl)) {
  throw new Error(
    'Build failed: VITE_API_BASE_URL contains a placeholder stage value. Remove "<stage>" and use the real API Gateway base URL.'
  );
}

if (!/^https?:\/\//i.test(baseUrl)) {
  throw new Error(
    'Build failed: VITE_API_BASE_URL must be an absolute URL starting with http:// or https://.'
  );
}

console.log('VITE_API_BASE_URL is set and valid:', baseUrl);
