export function buildProxyUrl(url: string, headers?: Record<string, string>): string {
  const encodedUrl = encodeURIComponent(url);
  let proxyUrl = `stream://${encodedUrl}`;
  if (headers && Object.keys(headers).length > 0) {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(headers)) {
      queryParams.append(`h_${key}`, value);
    }
    proxyUrl += `?${queryParams.toString()}`;
  }
  return proxyUrl;
}
