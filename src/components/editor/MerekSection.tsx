"use client";

import { Field, Catatan, PanduanButton } from "./fields";
import { KETERANGAN_MEREK, KUTIPAN } from "@/lib/ketentuan";
import { saranAdjMerek } from "@/lib/calc";
import { formatRp } from "@/lib/format";
import type { Dokumen, MerekRow } from "@/lib/types";

export function MerekSection({
  dok,
  onChangeRow,
  onTambah,
  onHapus,
  onTerapkanFpm,
}: {
  dok: Dokumen;
  onChangeRow: (id: string, patch: Partial<MerekRow>) => void;
  onTambah: () => void;
  onHapus: (id: string) => void;
  onTerapkanFpm: (merek: string, fpm: number) => void;
}) {
  const njt = dok.merek.find((m) => m.peran === "NJT");

  return (
    <section className="seksi">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="font-serif text-lg font-bold text-tinta-900">
          <span className="seksi-nomor">F.</span> Perhitungan Penyesuaian Merek
          <span className="text-xs font-sans text-abu ml-2">(Lembar Kedua)</span>
        </h2>
        <div className="flex items-center gap-2">
          <PanduanButton
            judul="Penyesuaian merek kendaraan (Fpm)"
            isi={KUTIPAN.penyesuaianMerek}
            contoh={
              <div className="text-xs leading-relaxed">
                <p>
                  Contoh: NJT Jialing Rp2.950.000; NJP Honda Rp6.000.000.
                  Fpm = (2.950.000 - 6.000.000) / 6.000.000 = -50,83%,
                  dibulatkan menjadi -51%.
                </p>
              </div>
            }
          />
          <button
            type="button"
            className="tombol tombol-garis text-xs px-3 py-1.5"
            onClick={onTambah}
          >
            Tambah merek
          </button>
        </div>
      </div>
      <p className="text-xs text-abu mb-4 max-w-3xl">
        Isi satu baris NJT untuk objek yang ditaksir dan baris NJP untuk setiap
        merek pembanding dengan spesifikasi sama atau paling mendekati. Fpm
        dihitung otomatis dan dapat diterapkan ke baris data lelang dengan merek
        yang sama.
      </p>

      {dok.merek.length === 0 ? (
        <p className="text-sm text-abu border border-dashed border-garis px-4 py-6 text-center">
          Belum ada perhitungan merek. Tambahkan bila objek memiliki merek yang
          tidak terdapat pada data harga penjualan lelang.
        </p>
      ) : (
        <div className="space-y-3">
          {dok.merek.map((m, i) => {
            const fpm =
              m.peran === "NJT"
                ? 0
                : njt && njt.harga > 0 && m.harga > 0
                  ? saranAdjMerek(njt.harga, m.harga)
                  : null;
            return (
              <div
                key={m.id}
                className="grid gap-3 border border-garis bg-white px-4 py-3 sm:grid-cols-[110px_1fr_160px_90px_1fr_auto] sm:items-end"
              >
                <Field label={`Peran ${i + 1}`}>
                  <select
                    className="field"
                    value={m.peran}
                    onChange={(e) =>
                      onChangeRow(m.id, {
                        peran: e.target.value as MerekRow["peran"],
                      })
                    }
                  >
                    <option value="NJT">NJT</option>
                    <option value="NJP">NJP</option>
                  </select>
                </Field>
                <Field label="Merek">
                  <input
                    className="field"
                    value={m.merek}
                    onChange={(e) =>
                      onChangeRow(m.id, { merek: e.target.value })
                    }
                    placeholder="Contoh: Honda"
                  />
                </Field>
                <Field label="Harga baru/harga jual saat ini">
                  <input
                    type="number"
                    className="field angka"
                    min={0}
                    value={m.harga || ""}
                    onChange={(e) =>
                      onChangeRow(m.id, {
                        harga: Number(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <div>
                  <span className="label">Fpm</span>
                  <p className="angka font-mono text-sm font-semibold text-tinta border border-garis-2 bg-kertas-2 px-2 py-2">
                    {fpm === null ? "—" : `${fpm}%`}
                  </p>
                </div>
                <Field label="Keterangan">
                  <input
                    className="field"
                    value={m.keterangan}
                    onChange={(e) =>
                      onChangeRow(m.id, { keterangan: e.target.value })
                    }
                    placeholder={
                      m.peran === "NJT"
                        ? KETERANGAN_MEREK.njr
                        : KETERANGAN_MEREK.pembanding
                    }
                  />
                </Field>
                <div className="flex flex-col gap-1 pb-0.5">
                  {m.peran === "NJP" && fpm !== null && m.merek ? (
                    <button
                      type="button"
                      className="tombol tombol-garis text-[11px] px-2 py-1"
                      onClick={() => onTerapkanFpm(m.merek, fpm)}
                      title={`Terapkan ${fpm}% ke baris data lelang merek ${m.merek}`}
                    >
                      Terapkan Fpm
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="text-xs text-stempel underline decoration-dotted"
                    onClick={() => onHapus(m.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3">
        <Catatan>
          NJT: harga baru objek yang ditaksir. NJP: harga baru objek pembanding.
          Bila kendaraan sudah tidak diproduksi, gunakan harga jual saat ini di
          pasar. Nilai Fpm dibulatkan ke bilangan bulat dan diisikan pada kolom
          Merek di tabel penyesuaian.
          {njt ? ` NJT saat ini: ${formatRp(njt.harga)} (${njt.merek || "objek"}).` : ""}
        </Catatan>
      </div>
    </section>
  );
}
