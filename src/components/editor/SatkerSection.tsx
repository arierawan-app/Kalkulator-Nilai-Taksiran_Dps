"use client";

import { Field, Catatan } from "./fields";
import type { Satker } from "@/lib/types";

export function SatkerSection({
  satker,
  onChange,
}: {
  satker: Satker;
  onChange: (patch: Partial<Satker>) => void;
}) {
  const unggahLogo = (file: File | undefined) => {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Logo harus berupa file PNG atau JPEG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran logo melebihi 2 MB. Gunakan file yang lebih kecil.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => onChange({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <section className="seksi">
      <h2 className="font-serif text-lg font-bold text-tinta-900 mb-4">
        <span className="seksi-nomor">A.</span> Identitas Satuan Kerja
      </h2>
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <Field label="Logo Kementerian/Lembaga (PNG/JPEG)">
          <div className="flex items-center gap-3">
            <div className="h-20 w-20 border border-dashed border-garis bg-white flex items-center justify-center overflow-hidden">
              {satker.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={satker.logoDataUrl}
                  alt="Logo satker"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="text-[10px] text-abu text-center px-1">
                  Belum ada logo
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="tombol tombol-garis text-xs px-2.5 py-1.5 cursor-pointer">
                Pilih file
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => unggahLogo(e.target.files?.[0])}
                />
              </label>
              {satker.logoDataUrl ? (
                <button
                  type="button"
                  className="text-xs text-stempel underline decoration-dotted"
                  onClick={() => onChange({ logoDataUrl: "" })}
                >
                  Hapus logo
                </button>
              ) : null}
            </div>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Kementerian/Lembaga">
            <input
              className="field"
              value={satker.namaKementerian}
              onChange={(e) => onChange({ namaKementerian: e.target.value })}
              placeholder="Contoh: KEMENTERIAN KEUANGAN"
            />
          </Field>
          <Field label="Nama Satuan Kerja">
            <input
              className="field"
              value={satker.namaSatker}
              onChange={(e) => onChange({ namaSatker: e.target.value })}
              placeholder="Contoh: Sekretariat Jenderal"
            />
          </Field>
          <Field label="Nomor Kertas Kerja">
            <input
              className="field"
              value={satker.nomorKertasKerja}
              onChange={(e) =>
                onChange({ nomorKertasKerja: e.target.value })
              }
              placeholder="Contoh: 01/KT-BMN/2026"
            />
          </Field>
          <Field
            label="Tujuan Pemindahtanganan"
            hint="Faktor kondisi yang diterapkan berbeda antara penjualan lelang dan tanpa lelang."
          >
            <select
              className="field"
              value={satker.tujuan}
              onChange={(e) =>
                onChange({ tujuan: e.target.value as Satker["tujuan"] })
              }
            >
              <option value="lelang">Penjualan melalui lelang</option>
              <option value="tanpa_lelang">
                Penjualan tanpa melalui lelang
              </option>
            </select>
          </Field>
        </div>
      </div>
      <div className="mt-3">
        <Catatan>
          Logo dan nama satker digunakan pada kop kertas kerja PDF (menyerupai
          format kertas kerja analisis penentuan nilai taksiran).
        </Catatan>
      </div>
    </section>
  );
}
