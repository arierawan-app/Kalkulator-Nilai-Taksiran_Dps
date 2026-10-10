export const NAMA_COOKIE_SESI_AMAN = "__Secure-authjs.session-token";
export const NAMA_COOKIE_SESI = "authjs.session-token";

/**
 * Auth.js memberi awalan "__Secure-" pada nama cookie sesi ketika aplikasi
 * diakses melalui HTTPS (mis. Vercel), dan tanpa awalan pada HTTP
 * (mis. http://localhost). getToken() mencocokkan nama cookie dengan
 * `startsWith`, sehingga nama yang salah membuat sesi tidak ditemukan.
 */
export function deteksiNamaCookieSesi(
  cookieHeader: string | null | undefined
): string {
  const header = cookieHeader ?? "";
  return header.includes(NAMA_COOKIE_SESI_AMAN)
    ? NAMA_COOKIE_SESI_AMAN
    : NAMA_COOKIE_SESI;
}
