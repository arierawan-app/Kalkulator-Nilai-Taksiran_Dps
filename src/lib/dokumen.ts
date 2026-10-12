import {
  DOKUMEN_KEPEMILIKAN,
  type Dokumen,
  type DokumenKepemilikan,
  type LelangRow,
  type MerekRow,
} from "./types";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function barisLelangKosong(
  tahunPenilaian: number,
  tahunPembuatan: number
): LelangRow {
  return {
    id: uid(),
    namaKPKNL: "",
    kodeLelang: "",
    merek: "",
    tipe: "",
    harga: 0,
    waktuLelang: tahunPenilaian - 1,
    kategoriLokasi: 2,
    tahunPembuatan,
    tahapPencarian: 1,
    adjTipe: 0,
    adjMerek: 0,
    adjWaktu: 0,
    adjLokasi: 0,
    adjTahun: 0,
    konfirmasiManual: false,
    catatan: "",
  };
}

export function dokumenBaru(): Dokumen {
  const tahun = new Date().getFullYear();
  return {
    namaFile: "",
    satker: {
      logoDataUrl: "",
      namaKementerian: "",
      namaSatker: "",
      nomorKertasKerja: "",
      tujuan: "lelang",
    },
    panitia: {
      kota: "Denpasar",
      tanggal: new Date().toISOString().slice(0, 10),
      anggota: [
        { id: uid(), jabatan: "Ketua", nama: "", nip: "" },
        { id: uid(), jabatan: "Anggota", nama: "", nip: "" },
      ],
    },
    tahunPenilaian: tahun,
    objek: {
      namaObjek: "",
      nup: "",
      lokasiObjek: "",
      provinsi: "Bali",
      kpknl: "KPKNL Denpasar",
      kategoriLokasi: 2,
      jenisKendaraan: "roda23",
      merek: "",
      tipe: "",
      cc: null,
      nomorPolisi: "",
      dokumen: ["BPKB"],
      dokumenLainnya: "",
      pemilikDokumen: "",
      masaBerlaku: "Masih berlaku",
      keteranganMasaBerlaku: "",
      penggunaan: "Kendaraan Dinas",
      keteranganLain: "",
      warna: "",
      tahunPembuatan: tahun - 10,
      bahanBakar: "Bensin",
      tingkatKerusakan: "sampai_80",
    },
    lelang: [
      barisLelangKosong(tahun, tahun - 10),
      barisLelangKosong(tahun, tahun - 10),
      barisLelangKosong(tahun, tahun - 10),
    ],
    merek: [],
    updatedAt: new Date().toISOString(),
  };
}

export function normalisasiDokumenKepemilikan(
  input: unknown
): DokumenKepemilikan[] {
  const daftar: unknown[] = Array.isArray(input)
    ? input
    : input === undefined || input === null
      ? []
      : [input];
  const terpilih = DOKUMEN_KEPEMILIKAN.filter((d) => daftar.includes(d));
  if (terpilih.includes("Tidak ada") && terpilih.length > 1) {
    return terpilih.filter((d) => d !== "Tidak ada");
  }
  return [...terpilih];
}

export function normalisasiDokumen(input: unknown): Dokumen {
  const dasar = dokumenBaru();
  const d = (input ?? {}) as Partial<Dokumen>;
  const objekGabung = { ...dasar.objek, ...d.objek };
  return {
    ...dasar,
    ...d,
    satker: { ...dasar.satker, ...d.satker },
    panitia: {
      ...dasar.panitia,
      ...d.panitia,
      anggota:
        Array.isArray(d.panitia?.anggota) && d.panitia!.anggota.length > 0
          ? d.panitia!.anggota
          : dasar.panitia.anggota,
    },
    objek: {
      ...objekGabung,
      dokumen: normalisasiDokumenKepemilikan(objekGabung.dokumen),
      dokumenLainnya:
        typeof objekGabung.dokumenLainnya === "string"
          ? objekGabung.dokumenLainnya
          : "",
    },
    lelang:
      Array.isArray(d.lelang) && d.lelang.length > 0
        ? d.lelang.map((r) => ({
            ...barisLelangKosong(
              d.tahunPenilaian ?? dasar.tahunPenilaian,
              tahunPembuatanDefault(d)
            ),
            ...r,
          }))
        : dasar.lelang,
    merek: Array.isArray(d.merek) ? d.merek : [],
    updatedAt: d.updatedAt ?? new Date().toISOString(),
  };
}

function tahunPembuatanDefault(d: Partial<Dokumen>): number {
  return d.objek?.tahunPembuatan ?? new Date().getFullYear() - 10;
}

export function merekRowKosong(peran: MerekRow["peran"] = "NJP"): MerekRow {
  return {
    id: uid(),
    merek: "",
    harga: 0,
    peran,
    keterangan: "",
  };
}

export function namaFileDokumen(dok: Dokumen): string {
  const sanitasi = (s: string) => s.replace(/[\\/:*?"<>|]/g, "-").trim();
  const nomor = sanitasi(dok.satker.nomorKertasKerja) || "Draft";
  const objek = sanitasi(dok.objek.namaObjek) || "Taksiran";
  return `${nomor} - ${objek}.json`;
}

export function namaFilePdf(dok: Dokumen): string {
  const sanitasi = (s: string) => s.replace(/[\\/:*?"<>|]/g, "-").trim();
  const nomor = sanitasi(dok.satker.nomorKertasKerja) || "Draft";
  const objek = sanitasi(dok.objek.namaObjek) || "Taksiran";
  return `${nomor} - ${objek}.pdf`;
}

export function idBaru(): string {
  return uid();
}
