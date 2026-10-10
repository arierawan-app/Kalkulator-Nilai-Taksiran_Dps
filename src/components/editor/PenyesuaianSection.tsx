"use client";

import { Field, Catatan, Peringatan, PanduanButton } from "./fields";
import { KUTIPAN } from "@/lib/ketentuan";
import {
  klasifikasiKendaraan,
  saranAdjLokasi,
  saranAdjMerek,
  saranAdjTahunPembuatan,
  saranAdjWaktu,
  totalPersen,
  nilaiTaksiranBaris,
} from "@/lib/calc";
import { formatRp } from "@/lib/format";
import type { Dokumen, LelangRow } from "@/lib/types";

export function PenyesuaianSection({
  dok,
  onChangeRow,
}: {
  dok: Dokumen;
  onChangeRow: (id: string, patch: Partial<LelangRow>) => void;
}) {
  const kelas = klasifikasiKendaraan(
    dok.objek.jenisKendaraan,
    dok.objek.cc ?? 0
  );
  const njt = dok.merek.find((m) => m.peran === "NJT")?.harga ?? null;
  const saranMerekUntuk = (row: LelangRow): number | null => {
    if (!njt) return null;
    const njp = dok.merek.find(
      (m) =>
        m.peran === "NJP" &&
        m.merek.trim().toLowerCase() === row.merek.trim().toLowerCase()
    )?.harga;
    if (!njp) return null;
    return saranAdjMerek(njt, njp);
  };

  return (
    <section className="seksi">
      <h2 className="font-serif text-lg font-bold text-tinta-900 mb-1">
        <span className="seksi-nomor">E.</span> Penyesuaian Data Pembanding
      </h2>
      <p className="text-xs text-abu mb-4 max-w-3xl">
        Persentase penyesuaian diisi oleh Panitia Penaksir. Aplikasi menampilkan
        nilai sesuai ketentuan sebagai pembanding; bila nilai yang Anda isi
        berbeda, centang konfirmasi pertimbangan penaksir agar kertas kerja
        dapat dicetak.
      </p>

      <div className="space-y-5">
        {dok.lelang.map((row, i) => {
          const nomor = i + 1;
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
          const saranMerek = saranMerekUntuk(row);
          const beda = (a: number, b: number) => Math.abs(a - b) > 0.001;
          const menyimpang =
            beda(row.adjWaktu, saranWaktu) ||
            beda(row.adjLokasi, saranLokasi) ||
            beda(row.adjTahun, saranTahun);

          const terapkanKetentuan = () => {
            const patch: Partial<LelangRow> = {
              adjWaktu: saranWaktu,
              adjLokasi: saranLokasi,
              adjTahun: saranTahun,
            };
            if (saranMerek !== null) patch.adjMerek = saranMerek;
            onChangeRow(row.id, patch);
          };

          return (
            <div key={row.id} className="border border-garis bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-garis-2 px-4 py-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-tinta">
                    Data {nomor}
                  </span>
                  <span className="text-xs text-abu">
                    {row.merek || "merek belum diisi"} - {row.tipe || "tipe belum diisi"} -{" "}
                    {formatRp(row.harga)}
                  </span>
                </div>
                <button
                  type="button"
                  className="tombol tombol-garis text-xs px-2.5 py-1"
                  onClick={terapkanKetentuan}
                >
                  Isi sesuai ketentuan
                </button>
              </div>

              <div className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-abu mb-3">
                  <span>
                    Nilai ketentuan: waktu <strong className="angka">{saranWaktu}%</strong>,
                    lokasi <strong className="angka">{saranLokasi}%</strong>, tahun
                    pembuatan <strong className="angka">{saranTahun}%</strong>
                    {saranMerek !== null ? (
                      <>
                        , merek <strong className="angka">{saranMerek}%</strong>
                      </>
                    ) : (
                      ", merek: isi tabel penyesuaian merek (Lembar Kedua)"
                    )}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <Field
                    label="Tipe (%)"
                    panduan={
                      <PanduanButton
                        judul="Penyesuaian tipe kendaraan"
                        isi={KUTIPAN.penyesuaianTipe}
                      />
                    }
                  >
                    <input
                      type="number"
                      className="field angka"
                      value={row.adjTipe}
                      onChange={(e) =>
                        onChangeRow(row.id, {
                          adjTipe: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field
                    label="Merek (%)"
                    panduan={
                      <PanduanButton
                        judul="Penyesuaian merek kendaraan (Fpm)"
                        isi={KUTIPAN.penyesuaianMerek}
                      />
                    }
                  >
                    <input
                      type="number"
                      className="field angka"
                      value={row.adjMerek}
                      onChange={(e) =>
                        onChangeRow(row.id, {
                          adjMerek: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field
                    label="Waktu (%)"
                    panduan={
                      <PanduanButton
                        judul="Penyesuaian tahun transaksi"
                        isi={KUTIPAN.penyesuaianWaktu}
                      />
                    }
                  >
                    <input
                      type="number"
                      className="field angka"
                      aria-invalid={
                        beda(row.adjWaktu, saranWaktu) && !row.konfirmasiManual
                          ? "true"
                          : undefined
                      }
                      value={row.adjWaktu}
                      onChange={(e) =>
                        onChangeRow(row.id, {
                          adjWaktu: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field
                    label="Lokasi (%)"
                    panduan={
                      <PanduanButton
                        judul="Penyesuaian lokasi"
                        isi={KUTIPAN.penyesuaianLokasi}
                      />
                    }
                  >
                    <input
                      type="number"
                      className="field angka"
                      aria-invalid={
                        beda(row.adjLokasi, saranLokasi) && !row.konfirmasiManual
                          ? "true"
                          : undefined
                      }
                      value={row.adjLokasi}
                      onChange={(e) =>
                        onChangeRow(row.id, {
                          adjLokasi: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                  <Field
                    label="Tahun pembuatan (%)"
                    panduan={
                      <PanduanButton
                        judul="Penyesuaian tahun pembuatan"
                        isi={KUTIPAN.penyesuaianTahunPembuatan}
                      />
                    }
                  >
                    <input
                      type="number"
                      className="field angka"
                      aria-invalid={
                        beda(row.adjTahun, saranTahun) && !row.konfirmasiManual
                          ? "true"
                          : undefined
                      }
                      value={row.adjTahun}
                      onChange={(e) =>
                        onChangeRow(row.id, {
                          adjTahun: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </Field>
                </div>

                {menyimpang ? (
                  <div className="mt-3 space-y-2">
                    <Peringatan>
                      Nilai pada baris ini berbeda dari ketentuan (waktu{" "}
                      {saranWaktu}%, lokasi {saranLokasi}%, tahun pembuatan{" "}
                      {saranTahun}%).
                    </Peringatan>
                    <label className="flex items-center gap-2 text-xs text-tinta">
                      <input
                        type="checkbox"
                        checked={row.konfirmasiManual}
                        onChange={(e) =>
                          onChangeRow(row.id, {
                            konfirmasiManual: e.target.checked,
                          })
                        }
                      />
                      Saya menyesuaikan dengan pertimbangan Panitia Penaksir.
                    </label>
                    <input
                      className="field"
                      placeholder="Catatan alasan penyesuaian (opsional)"
                      value={row.catatan}
                      onChange={(e) =>
                        onChangeRow(row.id, { catatan: e.target.value })
                      }
                    />
                  </div>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-garis-2 pt-3 text-sm">
                  <span className="text-abu text-xs">
                    Total penyesuaian:{" "}
                    <strong className="angka text-tinta">
                      {totalPersen(row)}%
                    </strong>
                  </span>
                  <span className="text-abu text-xs">
                    Nilai taksiran data:{" "}
                    <strong className="angka text-tinta">
                      {formatRp(nilaiTaksiranBaris(row))}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Catatan>
          Total penyesuaian adalah penjumlahan persentase tipe, merek, waktu,
          lokasi, dan tahun pembuatan. Nilai taksiran per data = harga lelang x
          (1 + total penyesuaian).
        </Catatan>
      </div>
    </section>
  );
}
