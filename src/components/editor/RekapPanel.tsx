"use client";

import {
  hitungFaktorKondisi,
  hitungRekap,
  punyaDokumenKepemilikan,
} from "@/lib/calc";
import { formatRp } from "@/lib/format";
import { ringkasTemuan } from "@/lib/validasi";
import type { Dokumen, TemuanValidasi } from "@/lib/types";

function Baris({ label, nilai, tebal }: { label: string; nilai: string; tebal?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 py-1.5 ${
        tebal ? "border-t border-garis pt-2 mt-1" : ""
      }`}
    >
      <span className={`text-xs ${tebal ? "font-semibold text-tinta-900" : "text-abu"}`}>
        {label}
      </span>
      <span className={`angka text-right ${tebal ? "font-bold text-tinta-900 text-base" : "text-sm text-tinta"}`}>
        {nilai}
      </span>
    </div>
  );
}

export function RekapPanel({
  dok,
  temuan,
  onPreview,
  onCetakPdf,
  onUnduhWord,
  sibuk,
}: {
  dok: Dokumen;
  temuan: TemuanValidasi[];
  onPreview: () => void;
  onCetakPdf: () => void;
  onUnduhWord: () => void;
  sibuk: boolean;
}) {
  const punyaDokumen = punyaDokumenKepemilikan(dok.objek.dokumen);
  const faktor = hitungFaktorKondisi(
    dok.satker.tujuan,
    dok.objek.tingkatKerusakan,
    punyaDokumen
  );
  const rekap = hitungRekap(dok.lelang, faktor);
  const ringkas = ringkasTemuan(temuan);
  const bolehCetak = ringkas.error.length === 0;

  return (
    <aside className="kolom-rekap p-5">
      <h3 className="font-serif font-bold text-tinta-900">
        Rekap Nilai Taksiran
      </h3>
      <p className="text-[11px] text-abu mt-0.5">
        {dok.lelang.length} data pembanding - faktor kondisi{" "}
        {dok.satker.tujuan === "lelang" ? "penjualan lelang" : "tanpa lelang"}
      </p>

      <div className="mt-3 divide-y divide-garis-2">
        <Baris label="Total nilai taksiran" nilai={formatRp(rekap.total)} />
        <Baris label="Rata-rata nilai taksiran" nilai={formatRp(rekap.rataRata)} />
        <Baris
          label={`Taksiran nilai limit (x ${faktor.toString().replace(".", ",")})`}
          nilai={formatRp(rekap.limit)}
        />
        <Baris label="Pembulatan ke atas ribuan" nilai={formatRp(rekap.pembulatan)} tebal />
      </div>

      {ringkas.error.length > 0 ? (
        <div className="mt-4">
          <span className="stempel-badge">perlu perbaikan</span>
          <ul className="mt-2 space-y-1.5 text-xs text-stempel leading-relaxed">
            {ringkas.error.slice(0, 6).map((t, i) => (
              <li key={i}>{t.pesan}</li>
            ))}
            {ringkas.error.length > 6 ? (
              <li>+{ringkas.error.length - 6} temuan lainnya.</li>
            ) : null}
          </ul>
        </div>
      ) : null}

      {ringkas.warning.length > 0 ? (
        <details className="mt-3 text-xs text-abu">
          <summary className="cursor-pointer font-semibold">
            {ringkas.warning.length} peringatan
          </summary>
          <ul className="mt-2 space-y-1 leading-relaxed list-disc pl-4">
            {ringkas.warning.map((t, i) => (
              <li key={i}>{t.pesan}</li>
            ))}
          </ul>
        </details>
      ) : null}

      {ringkas.info.length > 0 ? (
        <ul className="mt-3 space-y-1 text-[11px] text-abu leading-relaxed">
          {ringkas.info.map((t, i) => (
            <li key={i}>{t.pesan}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 space-y-2">
        <button
          type="button"
          className="tombol tombol-utama w-full justify-center"
          onClick={onPreview}
          disabled={!bolehCetak}
          title={bolehCetak ? "Pratinjau kertas kerja" : "Perbaiki temuan terlebih dahulu"}
        >
          Pratinjau kertas kerja
        </button>
        <button
          type="button"
          className="tombol tombol-garis w-full justify-center"
          onClick={onCetakPdf}
          disabled={!bolehCetak || sibuk}
          title="Buka dialog cetak browser; pilih Simpan sebagai PDF"
        >
          Cetak / Simpan PDF
        </button>
        <button
          type="button"
          className="tombol tombol-garis w-full justify-center"
          onClick={onUnduhWord}
          disabled={!bolehCetak || sibuk}
          title="Unduh kertas kerja sebagai dokumen Microsoft Word"
        >
          Unduh Word (.docx)
        </button>
      </div>
      <p className="text-[10px] text-abu mt-3 leading-relaxed">
        Nilai taksiran berlaku 6 bulan sejak tanggal penentuan. Pembulatan ke
        atas pada ribuan rupiah.
      </p>
    </aside>
  );
}
