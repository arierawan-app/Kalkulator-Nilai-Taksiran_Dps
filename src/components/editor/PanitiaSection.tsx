"use client";

import { Field, Catatan } from "./fields";
import { idBaru } from "@/lib/dokumen";
import type { Panitia, PanitiaAnggota } from "@/lib/types";

export function PanitiaSection({
  panitia,
  tahunPenilaian,
  onChange,
  onChangeTahunPenilaian,
}: {
  panitia: Panitia;
  tahunPenilaian: number;
  onChange: (patch: Partial<Panitia>) => void;
  onChangeTahunPenilaian: (tahun: number) => void;
}) {
  const ubahAnggota = (id: string, patch: Partial<PanitiaAnggota>) => {
    onChange({
      anggota: panitia.anggota.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    });
  };

  const tambahAnggota = () => {
    onChange({
      anggota: [
        ...panitia.anggota,
        { id: idBaru(), jabatan: "Anggota", nama: "", nip: "" },
      ],
    });
  };

  const hapusAnggota = (id: string) => {
    onChange({ anggota: panitia.anggota.filter((a) => a.id !== id) });
  };

  return (
    <section className="seksi">
      <h2 className="font-serif text-lg font-bold text-tinta-900 mb-4">
        <span className="seksi-nomor">B.</span> Panitia Penaksir dan Waktu
        Penentuan
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Kota penentuan nilai taksiran">
          <input
            className="field"
            value={panitia.kota}
            onChange={(e) => onChange({ kota: e.target.value })}
            placeholder="Contoh: Denpasar"
          />
        </Field>
        <Field label="Tanggal penentuan nilai taksiran">
          <input
            type="date"
            className="field"
            value={panitia.tanggal}
            onChange={(e) => onChange({ tanggal: e.target.value })}
          />
        </Field>
        <Field
          label="Tahun penilaian"
          hint="Dipakai untuk validasi tahun transaksi lelang."
        >
          <input
            type="number"
            className="field angka"
            value={tahunPenilaian}
            min={2000}
            max={2100}
            onChange={(e) =>
              onChangeTahunPenilaian(Number(e.target.value) || 0)
            }
          />
        </Field>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="label mb-0">Susunan Panitia Penaksir</span>
          <button
            type="button"
            className="tombol tombol-garis text-xs px-2.5 py-1"
            onClick={tambahAnggota}
          >
            Tambah anggota
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {panitia.anggota.map((a, i) => (
            <div
              key={a.id}
              className="grid gap-2 sm:grid-cols-[130px_1fr_200px_40px] items-center"
            >
              <select
                className="field"
                value={a.jabatan}
                onChange={(e) =>
                  ubahAnggota(a.id, {
                    jabatan: e.target.value as PanitiaAnggota["jabatan"],
                  })
                }
              >
                <option value="Ketua">Ketua</option>
                <option value="Anggota">Anggota</option>
              </select>
              <input
                className="field"
                value={a.nama}
                placeholder={`Nama anggota ${i + 1}`}
                onChange={(e) => ubahAnggota(a.id, { nama: e.target.value })}
              />
              <input
                className="field angka"
                value={a.nip}
                placeholder="NIP (opsional)"
                onChange={(e) => ubahAnggota(a.id, { nip: e.target.value })}
              />
              <button
                type="button"
                className="text-stempel text-xs underline decoration-dotted"
                onClick={() => hapusAnggota(a.id)}
                disabled={panitia.anggota.length <= 1}
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Catatan>
            Kota dan tanggal ini muncul pada bagian tanda tangan kertas kerja.
            Nilai taksiran berlaku 6 bulan sejak tanggal penentuan.
          </Catatan>
        </div>
      </div>
    </section>
  );
}
