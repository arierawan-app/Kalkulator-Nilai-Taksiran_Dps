import {
  BATAS,
  KOTA_TANPA_PERLUASAN,
  KUTIPAN,
  PROVINSI_WILAYAH,
  WILAYAH,
} from "./ketentuan";
import type { WilayahKey } from "./ketentuan";
import {
  klasifikasiKendaraan,
  saranAdjLokasi,
  saranAdjTahunPembuatan,
  saranAdjWaktu,
  tahunLelangValid,
  dalamRentangTahunPembuatan,
} from "./calc";
import type { Dokumen, LelangRow, TemuanValidasi } from "./types";

export function wilayahDariProvinsi(provinsi: string): WilayahKey | null {
  return PROVINSI_WILAYAH[provinsi] ?? null;
}

export function infoWilayah(provinsi: string) {
  const key = wilayahDariProvinsi(provinsi);
  if (!key) return null;
  return { key, ...WILAYAH[key] };
}

export function kotaTanpaPerluasan(kota: string): boolean {
  const normal = kota.trim().toLowerCase();
  return KOTA_TANPA_PERLUASAN.some((k) => k.toLowerCase() === normal);
}

export function cekTahunLelang(
  tahunPenilaian: number,
  tahunLelang: number
): TemuanValidasi | null {
  if (!tahunLelang || !tahunPenilaian) return null;
  if (!tahunLelangValid(tahunPenilaian, tahunLelang)) {
    return {
      tingkat: "error",
      bidang: "waktuLelang",
      pesan: `Tahun lelang ${tahunLelang} ditolak. ${KUTIPAN.waktuLelang}`,
    };
  }
  return null;
}

function deviasi(a: number, b: number): boolean {
  return Math.abs(a - b) > 0.001;
}

export function temuanDeviasiRow(
  dok: Dokumen,
  row: LelangRow,
  nomor: number
): TemuanValidasi[] {
  const temuan: TemuanValidasi[] = [];
  const kelas = klasifikasiKendaraan(
    dok.objek.jenisKendaraan,
    dok.objek.cc ?? 0
  );
  const saranWaktu = saranAdjWaktu(dok.tahunPenilaian, row.waktuLelang);
  const saranLokasi = saranAdjLokasi(
    dok.objek.kategoriLokasi,
    row.kategoriLokasi
  );
  const saranTahun = saranAdjTahunPembuatan(
    dok.objek.tahunPembuatan,
    row.tahunPembuatan,
    kelas
  );
  const menyimpang =
    deviasi(row.adjWaktu, saranWaktu) ||
    deviasi(row.adjLokasi, saranLokasi) ||
    deviasi(row.adjTahun, saranTahun);
  if (menyimpang && !row.konfirmasiManual) {
    temuan.push({
      tingkat: "error",
      bidang: `penyesuaian-${nomor}`,
      pesan:
        `Baris ${nomor}: nilai penyesuaian menyimpang dari ketentuan ` +
        `(waktu ${saranWaktu}%, lokasi ${saranLokasi}%, tahun pembuatan ${saranTahun}%). ` +
        `Centang konfirmasi "Sesuai pertimbangan penaksir" pada baris ini agar dapat dicetak.`,
    });
  }
  return temuan;
}

export function validasiDokumen(dok: Dokumen): TemuanValidasi[] {
  const temuan: TemuanValidasi[] = [];
  const { satker, panitia, objek, lelang } = dok;

  if (!satker.namaKementerian.trim()) {
    temuan.push({ tingkat: "error", bidang: "namaKementerian", pesan: "Nama Kementerian belum diisi." });
  }
  if (!satker.namaSatker.trim()) {
    temuan.push({ tingkat: "error", bidang: "namaSatker", pesan: "Nama satuan kerja belum diisi." });
  }
  if (!satker.nomorKertasKerja.trim()) {
    temuan.push({ tingkat: "error", bidang: "nomorKertasKerja", pesan: "Nomor kertas kerja belum diisi." });
  }
  if (!panitia.kota.trim()) {
    temuan.push({ tingkat: "error", bidang: "kota", pesan: "Kota penentuan nilai taksiran belum diisi." });
  }
  if (!panitia.tanggal) {
    temuan.push({ tingkat: "error", bidang: "tanggal", pesan: "Tanggal penentuan nilai taksiran belum diisi." });
  }
  if (!panitia.anggota.some((a) => a.nama.trim())) {
    temuan.push({ tingkat: "error", bidang: "panitia", pesan: "Nama Panitia Penaksir belum diisi." });
  }
  panitia.anggota.forEach((a, i) => {
    if (!a.nama.trim()) {
      temuan.push({ tingkat: "warning", bidang: `panitia-${i}`, pesan: `Nama anggota Panitia Penaksir baris ${i + 1} kosong.` });
    }
  });

  if (!dok.tahunPenilaian) {
    temuan.push({ tingkat: "error", bidang: "tahunPenilaian", pesan: "Tahun penilaian belum diisi." });
  }
  if (!objek.namaObjek.trim()) {
    temuan.push({ tingkat: "error", bidang: "namaObjek", pesan: "Nama objek belum diisi." });
  }
  if (!objek.lokasiObjek.trim()) {
    temuan.push({ tingkat: "error", bidang: "lokasiObjek", pesan: "Lokasi objek belum diisi." });
  }
  if (objek.kategoriLokasi < 1 || objek.kategoriLokasi > 4) {
    temuan.push({ tingkat: "error", bidang: "kategoriLokasi", pesan: "Kategori lokasi objek harus 1 sampai 4." });
  }
  if (!objek.merek.trim()) {
    temuan.push({ tingkat: "error", bidang: "merek", pesan: "Merek objek belum diisi." });
  }
  if (!objek.tipe.trim()) {
    temuan.push({ tingkat: "error", bidang: "tipe", pesan: "Tipe objek belum diisi." });
  }
  if (!objek.cc || objek.cc <= 0) {
    temuan.push({
      tingkat: "error",
      bidang: "cc",
      pesan: `Kapasitas silinder (cc) objek belum diisi. ${KUTIPAN.klasifikasiCC}`,
    });
  }
  if (!objek.tahunPembuatan) {
    temuan.push({ tingkat: "error", bidang: "tahunPembuatan", pesan: "Tahun pembuatan objek belum diisi." });
  }
  if (objek.dokumen.length === 0) {
    temuan.push({ tingkat: "error", bidang: "dokumen", pesan: "Dokumen kepemilikan belum dipilih." });
  }
  if (
    objek.dokumen.includes("Lainnya") &&
    !(objek.dokumenLainnya ?? "").trim()
  ) {
    temuan.push({
      tingkat: "error",
      bidang: "dokumenLainnya",
      pesan: "Sebutkan jenis dokumen kepemilikan pada pilihan \"Lainnya\".",
    });
  }
  if (kotaTanpaPerluasan(objek.lokasiObjek)) {
    temuan.push({ tingkat: "info", bidang: "lokasiObjek", pesan: KUTIPAN.batamSabang });
  }

  if (lelang.length > BATAS.maxData) {
    temuan.push({
      tingkat: "error",
      bidang: "jumlahData",
      pesan: `Jumlah data pembanding ${lelang.length} melebihi maksimal ${BATAS.maxData}. ${KUTIPAN.jumlahData}`,
    });
  }
  if (lelang.length < BATAS.minData) {
    temuan.push({
      tingkat: "error",
      bidang: "jumlahData",
      pesan: `Jumlah data pembanding baru ${lelang.length}, minimal ${BATAS.minData}. ${KUTIPAN.jumlahData}`,
    });
  }

  lelang.forEach((row, i) => {
    const no = i + 1;
    if (!row.namaKPKNL.trim()) {
      temuan.push({ tingkat: "warning", bidang: `row-${no}`, pesan: `Baris ${no}: lokasi lelang (KPKNL/kota) belum diisi.` });
    }
    if (!row.kodeLelang.trim()) {
      temuan.push({ tingkat: "warning", bidang: `row-${no}`, pesan: `Baris ${no}: kode lelang belum diisi.` });
    }
    if (!row.harga || row.harga <= 0) {
      temuan.push({ tingkat: "error", bidang: `row-${no}`, pesan: `Baris ${no}: harga lelang belum diisi.` });
    }
    const cekWaktu = cekTahunLelang(dok.tahunPenilaian, row.waktuLelang);
    if (cekWaktu) {
      temuan.push({ ...cekWaktu, bidang: `row-${no}`, pesan: `Baris ${no}: ${cekWaktu.pesan}` });
    }
    if (row.kategoriLokasi < 1 || row.kategoriLokasi > 4) {
      temuan.push({ tingkat: "error", bidang: `row-${no}`, pesan: `Baris ${no}: kategori lokasi lelang harus 1 sampai 4.` });
    }
    if (
      row.tahunPembuatan &&
      objek.tahunPembuatan &&
      !dalamRentangTahunPembuatan(objek.tahunPembuatan, row.tahunPembuatan)
    ) {
      temuan.push({
        tingkat: "error",
        bidang: `row-${no}`,
        pesan: `Baris ${no}: ${KUTIPAN.tahunPembuatan}`,
      });
    }
    if (row.tahapPencarian < 1 || row.tahapPencarian > 10) {
      temuan.push({ tingkat: "warning", bidang: `row-${no}`, pesan: `Baris ${no}: tahap pencarian data belum dipilih.` });
    }
    temuan.push(...temuanDeviasiRow(dok, row, no));
  });

  return temuan;
}

export function dapatCetakPdf(temuan: TemuanValidasi[]): boolean {
  return !temuan.some((t) => t.tingkat === "error");
}

export function ringkasTemuan(temuan: TemuanValidasi[]) {
  return {
    error: temuan.filter((t) => t.tingkat === "error"),
    warning: temuan.filter((t) => t.tingkat === "warning"),
    info: temuan.filter((t) => t.tingkat === "info"),
  };
}
