"use server";

import { auth } from "./auth";
import { klienSupabase } from "./supabase";
import { normalisasiKodeSatker, validasiSandiBaru } from "./satker";

export type HasilAksi = { ok: boolean; pesan: string };

const BATAS_LOGO_BASE64 = 2_900_000;

async function kodeDariSesi(): Promise<string | null> {
  const session = await auth();
  const kode = session?.user?.kodeSatker;
  return kode ? normalisasiKodeSatker(kode) : null;
}

export async function gantiSandi(input: {
  sandiLama: string;
  sandiBaru: string;
}): Promise<HasilAksi> {
  const kode = await kodeDariSesi();
  if (!kode) return { ok: false, pesan: "Sesi berakhir. Silakan masuk kembali." };

  const sandiLama = input.sandiLama ?? "";
  const sandiBaru = input.sandiBaru ?? "";
  const galat = validasiSandiBaru(sandiBaru);
  if (galat) return { ok: false, pesan: galat };
  if (!sandiLama) return { ok: false, pesan: "Isi kata sandi lama." };
  if (sandiBaru === sandiLama) {
    return { ok: false, pesan: "Kata sandi baru harus berbeda dari kata sandi lama." };
  }

  const { data, error } = await klienSupabase().rpc("knt_ganti_sandi", {
    p_kode: kode,
    p_sandi_lama: sandiLama,
    p_sandi_baru: sandiBaru,
  });
  if (error) {
    return { ok: false, pesan: "Gagal menyimpan kata sandi baru. Coba lagi." };
  }
  if (!data) return { ok: false, pesan: "Kata sandi lama tidak cocok." };
  return { ok: true, pesan: "Kata sandi berhasil diubah." };
}

export async function simpanLogoProfil(input: {
  sandi: string;
  logoDataUrl: string;
}): Promise<HasilAksi> {
  const kode = await kodeDariSesi();
  if (!kode) return { ok: false, pesan: "Sesi berakhir. Silakan masuk kembali." };

  const sandi = input.sandi ?? "";
  const logo = input.logoDataUrl ?? "";
  if (!sandi) return { ok: false, pesan: "Isi kata sandi saat ini." };
  if (
    !logo.startsWith("data:image/png;base64,") &&
    !logo.startsWith("data:image/jpeg;base64,")
  ) {
    return { ok: false, pesan: "Logo harus berupa file PNG atau JPEG." };
  }
  if (logo.length > BATAS_LOGO_BASE64) {
    return { ok: false, pesan: "Ukuran logo melebihi 2 MB. Gunakan file yang lebih kecil." };
  }

  const { data, error } = await klienSupabase().rpc("knt_simpan_logo", {
    p_kode: kode,
    p_sandi: sandi,
    p_logo: logo,
  });
  if (error) return { ok: false, pesan: "Gagal menyimpan logo. Coba lagi." };
  if (!data) return { ok: false, pesan: "Kata sandi saat ini tidak cocok." };
  return { ok: true, pesan: "Logo berhasil disimpan." };
}
