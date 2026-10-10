import { describe, expect, it } from "vitest";
import {
  faktorPenyesuaianMerek,
  hitungFaktorKondisi,
  hitungRekap,
  klasifikasiKendaraan,
  nilaiTaksiranBaris,
  pembulatanRibuanKeAtas,
  saranAdjLokasi,
  saranAdjMerek,
  saranAdjTahunPembuatan,
  saranAdjTipe,
  saranAdjWaktu,
  totalPersen,
} from "@/lib/calc";
import type { LelangRow } from "@/lib/types";

function row(partial: Partial<LelangRow>): LelangRow {
  return {
    id: Math.random().toString(36),
    namaKPKNL: "",
    kodeLelang: "",
    merek: "",
    tipe: "",
    harga: 0,
    waktuLelang: 2024,
    kategoriLokasi: 1,
    tahunPembuatan: 2024,
    tahapPencarian: 1,
    adjTipe: 0,
    adjMerek: 0,
    adjWaktu: 0,
    adjLokasi: 0,
    adjTahun: 0,
    konfirmasiManual: false,
    catatan: "",
    ...partial,
  };
}

describe("klasifikasiKendaraan", () => {
  it("mengklasifikasikan roda 2/3 sesuai batas cc", () => {
    expect(klasifikasiKendaraan("roda23", 100)).toBe("low-end");
    expect(klasifikasiKendaraan("roda23", 101)).toBe("middle");
    expect(klasifikasiKendaraan("roda23", 150)).toBe("middle");
    expect(klasifikasiKendaraan("roda23", 151)).toBe("high-end");
  });

  it("mengklasifikasikan roda 4+ sesuai batas cc", () => {
    expect(klasifikasiKendaraan("roda4plus", 1200)).toBe("low-end");
    expect(klasifikasiKendaraan("roda4plus", 1800)).toBe("middle");
    expect(klasifikasiKendaraan("roda4plus", 2500)).toBe("middle");
    expect(klasifikasiKendaraan("roda4plus", 2501)).toBe("high-end");
  });
});

describe("saran penyesuaian", () => {
  it("menghitung penyesuaian waktu 2% per tahun", () => {
    expect(saranAdjWaktu(2024, 2024)).toBe(0);
    expect(saranAdjWaktu(2024, 2023)).toBe(2);
    expect(saranAdjWaktu(2024, 2022)).toBe(4);
  });

  it("menghitung penyesuaian tahun pembuatan 5/7/10 persen per tahun", () => {
    expect(saranAdjTahunPembuatan(2010, 2008, "middle")).toBe(14);
    expect(saranAdjTahunPembuatan(2010, 2011, "middle")).toBe(-7);
    expect(saranAdjTahunPembuatan(1998, 1997, "low-end")).toBe(5);
    expect(saranAdjTahunPembuatan(2010, 2008, "high-end")).toBe(20);
  });

  it("menghitung penyesuaian lokasi 5% per perbedaan kategori", () => {
    expect(saranAdjLokasi(3, 1)).toBe(-10);
    expect(saranAdjLokasi(3, 2)).toBe(-5);
    expect(saranAdjLokasi(3, 3)).toBe(0);
    expect(saranAdjLokasi(1, 4)).toBe(15);
  });

  it("menghitung penyesuaian tipe 8% per tingkat kelas", () => {
    expect(saranAdjTipe(false, 1)).toBe(-8);
    expect(saranAdjTipe(true, 1)).toBe(8);
    expect(saranAdjTipe(true, 2)).toBe(16);
  });
});

describe("penyesuaian merek (Fpm)", () => {
  it("menghitung faktor dan pembulatan sesuai contoh dokumen", () => {
    expect(saranAdjMerek(3500000, 6000000)).toBe(-42);
    expect(faktorPenyesuaianMerek(3500000, 6000000)).toBeCloseTo(-41.6667, 3);
    expect(saranAdjMerek(2950000, 6000000)).toBe(-51);
    expect(saranAdjMerek(2950000, 4500000)).toBe(-34);
    expect(saranAdjMerek(2950000, 2950000)).toBe(0);
  });
});

describe("faktor kondisi", () => {
  it("menerapkan faktor penjualan lelang", () => {
    expect(hitungFaktorKondisi("lelang", "di_atas_90", true)).toBe(0.5);
    expect(hitungFaktorKondisi("lelang", "80_sampai_90", true)).toBe(0.6);
    expect(hitungFaktorKondisi("lelang", "sampai_80", true)).toBe(0.7);
  });

  it("menerapkan pengecualian tanpa dokumen kepemilikan", () => {
    expect(hitungFaktorKondisi("lelang", "sampai_80", false)).toBe(0.5);
    expect(hitungFaktorKondisi("lelang", "80_sampai_90", false)).toBe(0.5);
  });

  it("menerapkan faktor penjualan tanpa lelang", () => {
    expect(hitungFaktorKondisi("tanpa_lelang", "di_atas_90", true)).toBe(0.8);
    expect(hitungFaktorKondisi("tanpa_lelang", "80_sampai_90", true)).toBe(0.9);
    expect(hitungFaktorKondisi("tanpa_lelang", "sampai_80", true)).toBe(1.0);
  });
});

describe("pembulatan", () => {
  it("membulatkan ke atas pada ribuan", () => {
    expect(pembulatanRibuanKeAtas(377696.07)).toBe(378000);
    expect(pembulatanRibuanKeAtas(25829599.64)).toBe(25830000);
    expect(pembulatanRibuanKeAtas(5000)).toBe(5000);
    expect(pembulatanRibuanKeAtas(5000.01)).toBe(6000);
  });
});

describe("contoh kertas kerja Jialing (template)", () => {
  const rows: LelangRow[] = [
    row({ harga: 409999, adjWaktu: 4, adjMerek: 0, adjLokasi: 0, adjTahun: 0 }),
    row({ harga: 870990, adjWaktu: 4, adjMerek: -42, adjLokasi: -10, adjTahun: 5 }),
    row({ harga: 620000, adjWaktu: 0, adjMerek: -42, adjLokasi: -5, adjTahun: 5 }),
    row({ harga: 1510000, adjWaktu: 0, adjMerek: -42, adjLokasi: -5, adjTahun: 5 }),
  ];

  it("menghitung total, rata-rata, limit, dan pembulatan konsisten", () => {
    expect(totalPersen(rows[0])).toBe(4);
    expect(totalPersen(rows[1])).toBe(-43);
    expect(nilaiTaksiranBaris(rows[0])).toBeCloseTo(426398.96, 2);
    expect(nilaiTaksiranBaris(rows[1])).toBeCloseTo(496464.3, 2);
    expect(nilaiTaksiranBaris(rows[2])).toBeCloseTo(359600, 2);
    expect(nilaiTaksiranBaris(rows[3])).toBeCloseTo(875800, 2);

    const rekap = hitungRekap(rows, 0.7);
    expect(rekap.total).toBeCloseTo(2158263.26, 2);
    expect(rekap.rataRata).toBeCloseTo(539565.815, 3);
    expect(rekap.limit).toBeCloseTo(377696.0705, 3);
    expect(rekap.pembulatan).toBe(378000);
  });
});
