/**
 * Derivado, nunca un campo de backend: `Policy` solo lleva `issuedAt`. Cada
 * llamador debe marcarlo como calculado — ver la anotación "(calculado)" en
 * la pantalla de póliza.
 */
export function computeExpiry(issuedAt: string): Date {
  const expiry = new Date(issuedAt);
  expiry.setFullYear(expiry.getFullYear() + 1);
  return expiry;
}
