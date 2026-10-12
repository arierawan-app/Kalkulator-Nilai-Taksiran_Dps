import { klienSupabase } from "./supabase";
import { normalisasiKodeSatker } from "./satker";
import type { ProfilSatker } from "./types";

type BarisProfil = {
  kode_satker: string;
  nama_satker: string;
  nama_kementerian: string;
  logo_data_url: string | null;
  must_change_password: boolean;
};

export function barisKeProfil(baris: BarisProfil): ProfilSatker {
  return {
    kodeSatker: baris.kode_satker,
    namaSatker: baris.nama_satker,
    namaKementerian: baris.nama_kementerian,
    logoDataUrl: baris.logo_data_url ?? "",
    mustChangePassword: baris.must_change_password,
  };
}

export async function ambilProfilSatker(
  kode: string
): Promise<ProfilSatker | null> {
  const { data, error } = await klienSupabase().rpc("knt_profil", {
    p_kode: normalisasiKodeSatker(kode),
  });
  if (error || !data || data.length === 0) return null;
  return barisKeProfil(data[0] as BarisProfil);
}
