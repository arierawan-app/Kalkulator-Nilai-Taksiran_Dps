"use client";

import { useState } from "react";
import { Field, Catatan, Modal, PanduanButton, InputRupiah } from "./fields";
import { BATAS, KUTIPAN, TAHAPAN_PENCARIAN, WILAYAH } from "@/lib/ketentuan";
import type { Dokumen, LelangRow } from "@/lib/types";
import { cekTahunLelang, infoWilayah, kotaTanpaPerluasan } from "@/lib/validasi";
import kpknlData from "@/data/kpknl.json";
import type { Kpknl } from "@/lib/types";

const DAFTAR_KPKNL = kpknlData as Kpknl[];

const KPKNL_URUTAN_KEDUA = new Set([
  "KPKNL Surabaya",
  "KPKNL Sidoarjo",
  "KPKNL Makassar",
  "KPKNL Jakarta I",
  "KPKNL Jakarta II",
  "KPKNL Jakarta III",
  "KPKNL Jakarta IV",
  "KPKNL Jakarta V",
  "KPKNL Bogor",
  "KPKNL Tangerang I",
  "KPKNL Tangerang II",
  "KPKNL Bekasi",
]);

function saranWilayah(namaKpknl: string, provinsiObjek: string): string | null {
  const k = DAFTAR_KPKNL.find((d) => d.nama === namaKpknl);
  if (!k) return null;
  if (k.provinsi === provinsiObjek) {
    return `Urutan pertama: berada di satu provinsi dengan objek (${k.provinsi}).`;
  }
  if (KPKNL_URUTAN_KEDUA.has(k.nama)) {
    return "Termasuk KPKNL pada perluasan urutan kedua sesuai ketentuan wilayah.";
  }
  return `Wilayah kerja ${WILAYAH[k.wilayah].label}; cek kesesuaian dengan urutan perluasan wilayah.`;
}

export function LelangSection({
  dok,
  onChangeRow,
  onTambah,
  onHapus,
}: {
  dok: Dokumen;
  onChangeRow: (id: string, patch: Partial<LelangRow>) => void;
  onTambah: () => void;
  onHapus: (id: string) => void;
}) {
  const [popupWaktu, setPopupWaktu] = useState<{
    nomor: number;
    tahun: number;
  } | null>(null);

  const info = infoWilayah(dok.objek.provinsi);
  const tanpaPerluasan =
    kotaTanpaPerluasan(dok.objek.lokasiObjek) ||
    kotaTanpaPerluasan(dok.objek.kpknl.replace("KPKNL ", ""));

  const ubahWaktu = (row: LelangRow, nomor: number, teks: string) => {
    const nilai = Number(teks) || 0;
    onChangeRow(row.id, { waktuLelang: nilai });
    const tahunLengkap = /^\d{4,}$/.test(teks);
    const temuan = tahunLengkap
      ? cekTahunLelang(dok.tahunPenilaian, nilai)
      : null;
    if (temuan) {
      setPopupWaktu({ nomor, tahun: nilai });
    } else {
      setPopupWaktu((sebelum) => (sebelum?.nomor === nomor ? null : sebelum));
    }
  };

  const tambah = () => {
    if (dok.lelang.length >= BATAS.maxData) {
      alert(
        `Maksimal ${BATAS.maxData} data pembanding. ${KUTIPAN.jumlahData}`
      );
      return;
    }
    onTambah();
  };

  return (
    <section className="seksi">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-serif text-lg font-bold text-tinta-900">
          <span className="seksi-nomor">D.</span> Data Hasil Lelang
          <span className="ml-3 align-middle text-xs font-sans font-semibold text-abu">
            {dok.lelang.length} data (min {BATAS.minData}, maks {BATAS.maxData})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <PanduanButton
            judul="Tahapan pencarian data pembanding"
            isi={KUTIPAN.jumlahData}
            contoh={
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-kertas-2">
                      <th className="border border-garis px-2 py-1 text-left">Tahap</th>
                      <th className="border border-garis px-2 py-1 text-left">Wilayah</th>
                      <th className="border border-garis px-2 py-1 text-left">Merek</th>
                      <th className="border border-garis px-2 py-1 text-left">Tipe</th>
                      <th className="border border-garis px-2 py-1 text-left">Tahun pembuatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAHAPAN_PENCARIAN.map((t) => (
                      <tr key={t.tahap}>
                        <td className="border border-garis px-2 py-1">{t.tahap}</td>
                        <td className="border border-garis px-2 py-1">{t.wilayah}</td>
                        <td className="border border-garis px-2 py-1">{t.merek}</td>
                        <td className="border border-garis px-2 py-1">{t.tipe}</td>
                        <td className="border border-garis px-2 py-1">{t.tahun}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
          <button
            type="button"
            className="tombol tombol-garis text-xs px-3 py-1.5"
            onClick={tambah}
            disabled={dok.lelang.length >= BATAS.maxData}
          >
            Tambah data
          </button>
        </div>
      </div>

      <div className="mb-5 border border-garis bg-white px-4 py-3">
        <p className="text-xs font-semibold text-tinta mb-1">
          Urutan perluasan wilayah pencarian data - objek di {dok.objek.provinsi}
          {info ? ` (${info.label})` : ""}
        </p>
        {tanpaPerluasan ? (
          <p className="text-xs text-stempel leading-relaxed">
            {KUTIPAN.batamSabang}
          </p>
        ) : info ? (
          <ol className="text-xs text-abu leading-relaxed list-decimal pl-4 space-y-0.5">
            {info.urutan.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-abu">
            Lengkapi provinsi objek untuk menampilkan panduan wilayah.
          </p>
        )}
      </div>

      <div className="space-y-4">
        {dok.lelang.map((row, i) => {
          const nomor = i + 1;
          const temuanWaktu =
            row.waktuLelang >= 1000
              ? cekTahunLelang(dok.tahunPenilaian, row.waktuLelang)
              : null;
          const saran =
            row.namaKPKNL && dok.objek.provinsi
              ? saranWilayah(row.namaKPKNL, dok.objek.provinsi)
              : null;
          return (
            <div key={row.id} className="border border-garis bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-garis-2 px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-tinta">
                    Data {nomor}
                  </span>
                  {saran ? (
                    <span className="text-[11px] text-abu">{saran}</span>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="text-xs text-stempel underline decoration-dotted"
                  onClick={() => {
                    if (confirm(`Hapus data lelang ${nomor}?`)) onHapus(row.id);
                  }}
                >
                  Hapus
                </button>
              </div>
              <div className="grid gap-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Lokasi lelang (KPKNL/kota)">
                  <input
                    className="field"
                    list="daftar-kpknl"
                    value={row.namaKPKNL}
                    onChange={(e) =>
                      onChangeRow(row.id, { namaKPKNL: e.target.value })
                    }
                    placeholder="Contoh: KPKNL Denpasar"
                  />
                </Field>
                <Field label="Kode lelang">
                  <input
                    className="field"
                    value={row.kodeLelang}
                    onChange={(e) =>
                      onChangeRow(row.id, { kodeLelang: e.target.value })
                    }
                  />
                </Field>
                <Field label="Merek">
                  <input
                    className="field"
                    value={row.merek}
                    onChange={(e) =>
                      onChangeRow(row.id, { merek: e.target.value })
                    }
                  />
                </Field>
                <Field label="Tipe">
                  <input
                    className="field"
                    value={row.tipe}
                    onChange={(e) =>
                      onChangeRow(row.id, { tipe: e.target.value })
                    }
                  />
                </Field>

                <Field label="Harga lelang (Rp)">
                  <InputRupiah
                    nilai={row.harga}
                    onNilai={(harga) => onChangeRow(row.id, { harga })}
                  />
                </Field>
                <Field
                  label="Tahun transaksi lelang"
                  panduan={
                    <PanduanButton
                      judul="Batas tahun transaksi lelang"
                      isi={KUTIPAN.waktuLelang}
                    />
                  }
                  hint={
                    temuanWaktu
                      ? "Tahun lelang ditolak: melebihi 3 tahun sebelum tahun penilaian."
                      : `Maksimal ${BATAS.maksTahunLelangKebelakang} tahun sebelum tahun penilaian (${dok.tahunPenilaian}).`
                  }
                >
                  <input
                    type="number"
                    className="field angka"
                    aria-invalid={temuanWaktu ? "true" : undefined}
                    value={row.waktuLelang || ""}
                    min={1900}
                    max={2100}
                    onChange={(e) => ubahWaktu(row, nomor, e.target.value)}
                  />
                </Field>
                <Field label="Kategori lokasi lelang">
                  <select
                    className="field"
                    value={row.kategoriLokasi}
                    onChange={(e) =>
                      onChangeRow(row.id, {
                        kategoriLokasi: Number(e.target.value),
                      })
                    }
                  >
                    {[1, 2, 3, 4].map((k) => (
                      <option key={k} value={k}>
                        Kategori {k}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Tahun pembuatan"
                  hint={`Rentang yang diizinkan: ${dok.objek.tahunPembuatan - BATAS.rentangTahunPembuatan} - ${dok.objek.tahunPembuatan + BATAS.rentangTahunPembuatan}`}
                >
                  <input
                    type="number"
                    className="field angka"
                    value={row.tahunPembuatan || ""}
                    min={1900}
                    max={2100}
                    onChange={(e) =>
                      onChangeRow(row.id, {
                        tahunPembuatan: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <Field
                  label="Tahap pencarian"
                  panduan={
                    <PanduanButton
                      judul="Tahapan pencarian data secara komprehensif"
                      isi={`Pencarian dilakukan bertahap. Gunakan tahap sesuai kondisi data yang ditemukan; bila total data melebihi ${BATAS.maxData}, gunakan data dengan nilai terendah pada pencarian terakhir sehingga total mencapai ${BATAS.maxData} data.`}
                      contoh={
                        <ol className="text-xs leading-relaxed list-decimal pl-4 space-y-1">
                          {TAHAPAN_PENCARIAN.map((t) => (
                            <li key={t.tahap}>
                              <strong>Tahap {t.tahap}</strong> - {t.wilayah}:
                              merek {t.merek.toLowerCase()}, tipe{" "}
                              {t.tipe.toLowerCase()}, tahun {t.tahun.toLowerCase()}.
                            </li>
                          ))}
                        </ol>
                      }
                    />
                  }
                >
                  <select
                    className="field"
                    value={row.tahapPencarian}
                    onChange={(e) =>
                      onChangeRow(row.id, {
                        tahapPencarian: Number(e.target.value),
                      })
                    }
                  >
                    {TAHAPAN_PENCARIAN.map((t) => (
                      <option key={t.tahap} value={t.tahap}>
                        Tahap {t.tahap}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2 lg:col-span-3 flex items-end">
                  <Catatan>
                    Data pembanding berjumlah minimal {BATAS.minData} dan
                    maksimal {BATAS.maxData}; utamakan merek, tipe, dan tahun
                    pembuatan yang sama pada wilayah kerja KPKNL pelaksana.
                  </Catatan>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        buka={popupWaktu !== null}
        tutup={() => setPopupWaktu(null)}
        judul="Tahun transaksi lelang ditolak"
      >
        <p>
          Data {popupWaktu?.nomor} dengan tahun lelang {popupWaktu?.tahun}{" "}
          tidak dapat digunakan.
        </p>
        <p className="mt-3 text-abu">{KUTIPAN.waktuLelang}</p>
        <p className="mt-3">
          Perbaiki tahun lelang atau ganti data pembanding. Kertas kerja tidak
          dapat dicetak selama masih ada data yang ditolak.
        </p>
      </Modal>
    </section>
  );
}
