export const COOKIE_CONSENT_KEY = 'libreya_cookie_consent';

export function hasAdConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}
