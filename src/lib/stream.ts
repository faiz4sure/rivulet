export function buildProxyUrl(url: string, headers?: Record<string, string>): string {
  const headersObj = headers && Object.keys(headers).length > 0 ? headers : {};
  const headersB64 = btoa(JSON.stringify(headersObj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `stream://localhost/${headersB64}/${url}`;
}
