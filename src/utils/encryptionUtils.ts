export function encrypt(data: string, _key?: string): string {
  try {
    return btoa(unescape(encodeURIComponent(data)));
  } catch {
    return '';
  }
}

export function decrypt(data: string, _key?: string): string {
  try {
    return decodeURIComponent(escape(atob(data)));
  } catch {
    return '';
  }
}
