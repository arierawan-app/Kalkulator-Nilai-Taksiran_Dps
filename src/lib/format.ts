const numberFmt2 = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFmt0 = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRp(nilai: number): string {
  const aman = Number.isFinite(nilai) ? nilai : 0;
  return `Rp${numberFmt2.format(aman)}`;
}

export function formatAngka(nilai: number): string {
  const aman = Number.isFinite(nilai) ? nilai : 0;
  return numberFmt0.format(aman);
}

export function formatPersen(nilai: number): string {
  const aman = Number.isFinite(nilai) ? nilai : 0;
  return `${aman}%`;
}

export function formatTanggalIndonesia(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
