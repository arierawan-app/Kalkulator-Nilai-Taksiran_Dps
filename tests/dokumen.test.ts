import { describe, expect, it } from "vitest";
import {
  dokumenBaru,
  normalisasiDokumen,
  normalisasiDokumenKepemilikan,
} from "@/lib/dokumen";
import { punyaDokumenKepemilikan } from "@/lib/calc";

describe("normalisasiDokumenKepemilikan", () => {
  it("mengubah nilai lama berupa teks menjadi daftar", () => {
    expect(normalisasiDokumenKepemilikan("BPKB")).toEqual(["BPKB"]);
    expect(normalisasiDokumenKepemilikan("Tidak ada")).toEqual(["Tidak ada"]);
  });

  it("mempertahankan beberapa pilihan", () => {
    expect(normalisasiDokumenKepemilikan(["BPKB", "STNK"])).toEqual([
      "BPKB",
      "STNK",
    ]);
  });

  it("membuang 'Tidak ada' bila ada dokumen lain", () => {
    expect(normalisasiDokumenKepemilikan(["Tidak ada", "BPKB"])).toEqual([
      "BPKB",
    ]);
  });

  it("mengabaikan nilai yang tidak dikenal", () => {
    expect(normalisasiDokumenKepemilikan(["BPKB", "KTP"])).toEqual(["BPKB"]);
    expect(normalisasiDokumenKepemilikan(undefined)).toEqual([]);
  });
});

describe("punyaDokumenKepemilikan", () => {
  it("bernilai benar bila ada dokumen selain 'Tidak ada'", () => {
    expect(punyaDokumenKepemilikan(["BPKB"])).toBe(true);
    expect(punyaDokumenKepemilikan(["STNK", "Lainnya"])).toBe(true);
  });

  it("bernilai salah bila 'Tidak ada' atau kosong", () => {
    expect(punyaDokumenKepemilikan(["Tidak ada"])).toBe(false);
    expect(punyaDokumenKepemilikan([])).toBe(false);
  });
});

describe("normalisasiDokumen draf lama", () => {
  it("membiarkan penggunaan kendaraan kosong agar placeholder tampil", () => {
    expect(dokumenBaru().objek.penggunaan).toBe("");
  });

  it("menghapus nilai contoh lama Kendaraan Dinas saat draft dibuka", () => {
    const lama = { objek: { penggunaan: "Kendaraan Dinas" } };
    expect(normalisasiDokumen(lama).objek.penggunaan).toBe("");
  });

  it("mempertahankan keterangan penggunaan yang diisi pengguna", () => {
    const tersimpan = { objek: { penggunaan: "Kendaraan operasional" } };
    expect(normalisasiDokumen(tersimpan).objek.penggunaan).toBe(
      "Kendaraan operasional"
    );
  });

  it("mengonversi dokumen kepemilikan tunggal dari draft lama", () => {
    const lama = { objek: { dokumen: "Tidak ada" } };
    expect(normalisasiDokumen(lama).objek.dokumen).toEqual(["Tidak ada"]);
  });

  it("memakai BPKB sebagai default bila draft tidak memuat dokumen", () => {
    expect(normalisasiDokumen({}).objek.dokumen).toEqual(["BPKB"]);
  });

  it("mengosongkan keterangan Lainnya bila belum ada", () => {
    const lama = { objek: { dokumen: ["Lainnya"] } };
    expect(normalisasiDokumen(lama).objek.dokumenLainnya).toBe("");
    expect(
      normalisasiDokumen({ objek: { dokumenLainnya: null } }).objek
        .dokumenLainnya
    ).toBe("");
  });

  it("mempertahankan keterangan Lainnya yang tersimpan", () => {
    const tersimpan = {
      objek: { dokumen: ["Lainnya"], dokumenLainnya: "Surat Keterangan" },
    };
    expect(normalisasiDokumen(tersimpan).objek.dokumenLainnya).toBe(
      "Surat Keterangan"
    );
  });
});
