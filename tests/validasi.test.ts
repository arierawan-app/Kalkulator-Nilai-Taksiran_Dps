import { describe, expect, it } from "vitest";
import {
  cekTahunLelang,
  infoWilayah,
  kotaTanpaPerluasan,
  validasiDokumen,
} from "@/lib/validasi";
import type { Dokumen, LelangRow } from "@/lib/types";

function row(partial: Partial<LelangRow>): LelangRow {
  return {
    id: Math.random().toString(36),
    namaKPKNL: "KPKNL Denpasar",
    kodeLelang: "ABC123",
    merek: "Honda",
    tipe: "Astrea",
    harga: 1000000,
    waktuLelang: 2023,
    kategoriLokasi: 2,
    tahunPembuatan: 2020,
    tahapPencarian: 1,
    adjTipe: 0,
    adjMerek: -42,
    adjWaktu: 2,
    adjLokasi: 0,
    adjTahun: 0,
    konfirmasiManual: true,
    catatan: "",
    ...partial,
  };
}

function dokumen(partial: Partial<Dokumen> = {}): Dokumen {
  return {
    namaFile: "test",
    satker: {
      logoDataUrl: "",
      namaKementerian: "Kementerian X",
      namaSatker: "Satker Y",
      nomorKertasKerja: "01/KK/2026",
      tujuan: "lelang",
    },
    panitia: {
      kota: "Denpasar",
      tanggal: "2026-10-10",
      anggota: [
        { id: "1", jabatan: "Ketua", nama: "A", nip: "" },
        { id: "2", jabatan: "Anggota", nama: "B", nip: "" },
      ],
    },
    tahunPenilaian: 2024,
    objek: {
      namaObjek: "Honda Revo",
      nup: "1",
      lokasiObjek: "Denpasar",
      provinsi: "Bali",
      kpknl: "KPKNL Denpasar",
      kategoriLokasi: 2,
      jenisKendaraan: "roda23",
      merek: "Honda",
      tipe: "Revo 110",
      cc: 110,
      nomorPolisi: "DK 1 AA",
      dokumen: "BPKB",
      pemilikDokumen: "Kementerian X",
      masaBerlaku: "Masih berlaku",
      keteranganMasaBerlaku: "",
      penggunaan: "Dinas",
      keteranganLain: "",
      warna: "Hitam",
      tahunPembuatan: 2020,
      bahanBakar: "Bensin",
      tingkatKerusakan: "sampai_80",
    },
    lelang: [
      row({}),
      row({}),
      row({}),
    ],
    merek: [],
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

describe("cekTahunLelang", () => {
  it("menolak data lebih dari 3 tahun sebelum penilaian", () => {
    expect(cekTahunLelang(2024, 2020)).not.toBeNull();
    expect(cekTahunLelang(2024, 2020)?.tingkat).toBe("error");
  });

  it("mengizinkan data tepat 3 tahun sebelum penilaian", () => {
    expect(cekTahunLelang(2024, 2021)).toBeNull();
    expect(cekTahunLelang(2024, 2024)).toBeNull();
  });
});

describe("wilayah", () => {
  it("memetakan provinsi Bali ke wilayah Bali-Nusra", () => {
    const info = infoWilayah("Bali");
    expect(info?.key).toBe("bali_nusa_tenggara");
    expect(info?.urutan[1]).toContain("Denpasar, Surabaya, dan Sidoarjo");
  });

  it("mendeteksi kota tanpa perluasan", () => {
    expect(kotaTanpaPerluasan("Batam")).toBe(true);
    expect(kotaTanpaPerluasan("Kota Sabang")).toBe(false);
    expect(kotaTanpaPerluasan("Denpasar")).toBe(false);
  });
});

describe("validasiDokumen", () => {
  it("lolos untuk dokumen lengkap dengan konfirmasi", () => {
    const temuan = validasiDokumen(dokumen());
    expect(temuan.filter((t) => t.tingkat === "error")).toHaveLength(0);
  });

  it("menolak jumlah data kurang dari 3", () => {
    const dok = dokumen({ lelang: [row({})] });
    const pesan = validasiDokumen(dok).map((t) => t.pesan).join(" ");
    expect(pesan).toContain("minimal 3");
  });

  it("menolak data lelang di luar rentang 5 tahun tahun pembuatan", () => {
    const dok = dokumen();
    dok.lelang[0] = row({ tahunPembuatan: 2010 });
    const pesan = validasiDokumen(dok).map((t) => t.pesan).join(" ");
    expect(pesan).toContain("5 (lima) tahun");
  });

  it("menolak penyesuaian menyimpang tanpa konfirmasi", () => {
    const dok = dokumen();
    dok.lelang[0] = row({ adjLokasi: 99, konfirmasiManual: false });
    const pesan = validasiDokumen(dok).map((t) => t.pesan).join(" ");
    expect(pesan).toContain("menyimpang dari ketentuan");
  });

  it("menerima penyesuaian menyimpang bila dikonfirmasi penaksir", () => {
    const dok = dokumen();
    dok.lelang[0] = row({ adjLokasi: 99, konfirmasiManual: true });
    const errors = validasiDokumen(dok).filter(
      (t) => t.tingkat === "error" && t.pesan.includes("menyimpang")
    );
    expect(errors).toHaveLength(0);
  });

  it("memberi info khusus untuk lokasi Batam/Sabang", () => {
    const dok = dokumen();
    dok.objek.lokasiObjek = "Batam";
    const temuan = validasiDokumen(dok);
    expect(temuan.some((t) => t.tingkat === "info")).toBe(true);
  });
});
