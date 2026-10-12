export function normalisasiKodeSatker(kode: string): string {
  return kode.trim().toUpperCase();
}

export function validasiSandiBaru(sandi: string): string | null {
  if (sandi.length < 8) return "Kata sandi minimal 8 karakter.";
  if (!/[A-Za-z]/.test(sandi) || !/\d/.test(sandi)) {
    return "Kata sandi harus memuat huruf dan angka.";
  }
  return null;
}

export function validasiLogo(file: { type: string; size: number }): string | null {
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    return "Logo harus berupa file PNG atau JPEG.";
  }
  if (file.size > 2 * 1024 * 1024) {
    return "Ukuran logo melebihi 2 MB. Gunakan file yang lebih kecil.";
  }
  return null;
}
