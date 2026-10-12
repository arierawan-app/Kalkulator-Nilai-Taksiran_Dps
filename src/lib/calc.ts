import {
  BATAS,
  FAKTOR_KONDISI,
  FAKTOR_TANPA_DOKUMEN,
  PENYESUAIAN,
  TARIF_TAHUN_PEMBUATAN,
} from "./ketentuan";
import type {
  JenisKendaraan,
  KelasKendaraan,
  TingkatKerusakan,
  TujuanPenjualan,
} from "./ketentuan";
import type {
  DokumenKepemilikan,
  HasilBaris,
  LelangRow,
  Objek,
  Rekap,
  SaranPenyesuaian,
} from "./types";

export function klasifikasiKendaraan(
  jenis: JenisKendaraan,
  cc: number
): KelasKendaraan {
  if (jenis === "roda23") {
    if (cc <= 100) return "low-end";
    if (cc <= 150) return "middle";
    return "high-end";
  }
  if (cc <= 1200) return "low-end";
  if (cc <= 2500) return "middle";
  return "high-end";
}

export function labelKelas(kelas: KelasKendaraan): string {
  if (kelas === "low-end") return "Low-end (kelas bawah)";
  if (kelas === "middle") return "Middle (kelas menengah)";
  return "High-end (kelas atas)";
}

export function saranAdjWaktu(tahunPenilaian: number, tahunLelang: number): number {
  return (tahunPenilaian - tahunLelang) * PENYESUAIAN.waktuPerTahun;
}

export function saranAdjTahunPembuatan(
  tahunObjek: number,
  tahunPembanding: number,
  kelas: KelasKendaraan
): number {
  return (tahunObjek - tahunPembanding) * TARIF_TAHUN_PEMBUATAN[kelas];
}

export function saranAdjLokasi(
  kategoriObjek: number,
  kategoriPembanding: number
): number {
  return (kategoriPembanding - kategoriObjek) * PENYESUAIAN.lokasiPerKategori;
}

export function saranAdjTipe(inferior: boolean, tingkatPerbedaan: number): number {
  const arah = inferior ? 1 : -1;
  return arah * tingkatPerbedaan * PENYESUAIAN.tipePerTingkat;
}

export function faktorPenyesuaianMerek(njt: number, njp: number): number {
  if (!njp) return 0;
  return ((njt - njp) / njp) * 100;
}

export function saranAdjMerek(njt: number, njp: number): number {
  return Math.round(faktorPenyesuaianMerek(njt, njp));
}

export function saranPenyesuaian(
  objek: Objek,
  row: LelangRow,
  tahunPenilaian: number,
  saranTipe: number | null,
  saranMerek: number | null
): SaranPenyesuaian {
  const kelas = klasifikasiKendaraan(objek.jenisKendaraan, objek.cc ?? 0);
  return {
    tipe: saranTipe,
    merek: saranMerek,
    waktu: saranAdjWaktu(tahunPenilaian, row.waktuLelang),
    lokasi: saranAdjLokasi(objek.kategoriLokasi, row.kategoriLokasi),
    tahunPembuatan: saranAdjTahunPembuatan(
      objek.tahunPembuatan,
      row.tahunPembuatan,
      kelas
    ),
  };
}

export function totalPersen(row: LelangRow): number {
  return (
    row.adjTipe + row.adjMerek + row.adjWaktu + row.adjLokasi + row.adjTahun
  );
}

export function nilaiTaksiranBaris(row: LelangRow): number {
  return row.harga * (1 + totalPersen(row) / 100);
}

export function pembulatanRibuanKeAtas(nilai: number): number {
  return Math.ceil(nilai / 1000) * 1000;
}

export function punyaDokumenKepemilikan(
  dokumen: DokumenKepemilikan[]
): boolean {
  return dokumen.some((d) => d !== "Tidak ada");
}

export function hitungFaktorKondisi(
  tujuan: TujuanPenjualan,
  tingkat: TingkatKerusakan,
  punyaDokumen: boolean
): number {
  if (tujuan === "lelang" && !punyaDokumen) {
    return FAKTOR_TANPA_DOKUMEN;
  }
  return FAKTOR_KONDISI[tujuan][tingkat];
}

export function hitungRekap(
  rows: LelangRow[],
  faktorKondisi: number
): Rekap {
  const baris: HasilBaris[] = rows.map((row) => ({
    row,
    totalPersen: totalPersen(row),
    nilaiTaksiran: nilaiTaksiranBaris(row),
  }));
  const total = baris.reduce((sum, b) => sum + b.nilaiTaksiran, 0);
  const rataRata = rows.length > 0 ? total / rows.length : 0;
  const limit = rataRata * faktorKondisi;
  return {
    baris,
    total,
    rataRata,
    faktorKondisi,
    limit,
    pembulatan: pembulatanRibuanKeAtas(limit),
  };
}

export function dalamRentangTahunPembuatan(
  tahunObjek: number,
  tahunPembanding: number
): boolean {
  return (
    Math.abs(tahunPembanding - tahunObjek) <= BATAS.rentangTahunPembuatan
  );
}

export function tahunLelangValid(
  tahunPenilaian: number,
  tahunLelang: number
): boolean {
  return tahunLelang >= tahunPenilaian - BATAS.maksTahunLelangKebelakang;
}
