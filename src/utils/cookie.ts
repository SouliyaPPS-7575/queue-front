/**
 * Get the value of a cookie by name.
 * @param name - Name of the cookie to retrieve.
 * @returns The cookie value, throws an error if not found or when not in a browser environment.
 */
export function getCookie(name: string): string {
  if (typeof document === 'undefined') {
    throw new Error('getCookie can only be used in the browser');
  }
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.startsWith(nameEQ)) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  throw new Error(`Cookie "${name}" not found`);
}