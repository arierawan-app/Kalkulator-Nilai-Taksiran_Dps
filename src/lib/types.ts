import type {
  JenisKendaraan,
  KelasKendaraan,
  TujuanPenjualan,
  TingkatKerusakan,
  WilayahKey,
} from "./ketentuan";

export type DokumenKepemilikan = "BPKB" | "STNK" | "Lainnya" | "Tidak ada";
export type MasaBerlaku = "Masih berlaku" | "Habis masa berlaku";

export type PanitiaAnggota = {
  id: string;
  jabatan: "Ketua" | "Anggota";
  nama: string;
  nip: string;
};

export type Satker = {
  logoDataUrl: string;
  namaKementerian: string;
  namaSatker: string;
  nomorKertasKerja: string;
  tujuan: TujuanPenjualan;
};

export type Panitia = {
  kota: string;
  tanggal: string;
  anggota: PanitiaAnggota[];
};

export type Objek = {
  namaObjek: string;
  nup: string;
  lokasiObjek: string;
  provinsi: string;
  kpknl: string;
  kategoriLokasi: number;
  jenisKendaraan: JenisKendaraan;
  merek: string;
  tipe: string;
  cc: number | null;
  nomorPolisi: string;
  dokumen: DokumenKepemilikan;
  pemilikDokumen: string;
  masaBerlaku: MasaBerlaku;
  keteranganMasaBerlaku: string;
  penggunaan: string;
  keteranganLain: string;
  warna: string;
  tahunPembuatan: number;
  bahanBakar: string;
  tingkatKerusakan: TingkatKerusakan;
};

export type LelangRow = {
  id: string;
  namaKPKNL: string;
  kodeLelang: string;
  merek: string;
  tipe: string;
  harga: number;
  waktuLelang: number;
  kategoriLokasi: number;
  tahunPembuatan: number;
  tahapPencarian: number;
  adjTipe: number;
  adjMerek: number;
  adjWaktu: number;
  adjLokasi: number;
  adjTahun: number;
  konfirmasiManual: boolean;
  catatan: string;
};

export type MerekRow = {
  id: string;
  merek: string;
  harga: number;
  peran: "NJT" | "NJP";
  keterangan: string;
};

export type Dokumen = {
  namaFile: string;
  satker: Satker;
  panitia: Panitia;
  tahunPenilaian: number;
  objek: Objek;
  lelang: LelangRow[];
  merek: MerekRow[];
  updatedAt: string;
};

export type Kpknl = {
  nama: string;
  provinsi: string;
  wilayah: WilayahKey;
  kanwil: string;
};

export type HasilBaris = {
  row: LelangRow;
  totalPersen: number;
  nilaiTaksiran: number;
};

export type Rekap = {
  baris: HasilBaris[];
  total: number;
  rataRata: number;
  faktorKondisi: number;
  limit: number;
  pembulatan: number;
};

export type SaranPenyesuaian = {
  tipe: number | null;
  merek: number | null;
  waktu: number;
  lokasi: number;
  tahunPembuatan: number;
};

export type TingkatValidasi = "error" | "warning" | "info";

export type TemuanValidasi = {
  tingkat: TingkatValidasi;
  bidang: string;
  pesan: string;
};
