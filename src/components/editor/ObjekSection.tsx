"use client";

import { Field, Catatan, PanduanButton } from "./fields";
import { KUTIPAN, PROVINSI_WILAYAH, LABEL_TINGKAT, LABEL_TINGKAT_TANPA_LELANG } from "@/lib/ketentuan";
import { DOKUMEN_KEPEMILIKAN } from "@/lib/types";
import type { DokumenKepemilikan, Objek } from "@/lib/types";
import {
  hitungFaktorKondisi,
  klasifikasiKendaraan,
  labelKelas,
  punyaDokumenKepemilikan,
} from "@/lib/calc";
import { TARIF_TAHUN_PEMBUATAN } from "@/lib/ketentuan";
import type { TujuanPenjualan } from "@/lib/ketentuan";
import kpknlData from "@/data/kpknl.json";
import type { Kpknl } from "@/lib/types";

const PROVINSI = Object.keys(PROVINSI_WILAYAH).sort((a, b) =>
  a.localeCompare(b, "id")
);

const KPKNL_PER_PROVINSI: [string, Kpknl[]][] = (() => {
  const map = new Map<string, Kpknl[]>();
  for (const k of kpknlData as Kpknl[]) {
    const daftar = map.get(k.provinsi) ?? [];
    daftar.push(k);
    map.set(k.provinsi, daftar);
  }
  return Array.from(map.entries())
    .map(
      ([provinsi, daftar]) =>
        [
          provinsi,
          daftar.sort((a, b) => a.nama.localeCompare(b.nama, "id")),
        ] as [string, Kpknl[]]
    )
    .sort((a, b) => a[0].localeCompare(b[0], "id"));
})();

const SEMUA_NAMA_KPKNL = new Set(
  (kpknlData as Kpknl[]).map((k) => k.nama)
);

export function ObjekSection({
  objek,
  tujuan,
  onChange,
}: {
  objek: Objek;
  tujuan: TujuanPenjualan;
  onChange: (patch: Partial<Objek>) => void;
}) {
  const cc = objek.cc ?? 0;
  const kelas = cc > 0 ? klasifikasiKendaraan(objek.jenisKendaraan, cc) : null;
  const punyaDokumen = punyaDokumenKepemilikan(objek.dokumen);
  const faktor = hitungFaktorKondisi(tujuan, objek.tingkatKerusakan, punyaDokumen);

  const ubahDokumen = (nilai: DokumenKepemilikan) => {
    const terpilih = objek.dokumen.includes(nilai);
    if (nilai === "Tidak ada") {
      onChange({ dokumen: terpilih ? [] : ["Tidak ada"] });
      return;
    }
    const tanpaTidakAda = objek.dokumen.filter((d) => d !== "Tidak ada");
    onChange({
      dokumen: terpilih
        ? tanpaTidakAda.filter((d) => d !== nilai)
        : [...tanpaTidakAda, nilai],
    });
  };

  return (
    <section className="seksi">
      <h2 className="font-serif text-lg font-bold text-tinta-900 mb-4">
        <span className="seksi-nomor">C.</span> Identifikasi dan Fisik Objek
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Nama objek" className="lg:col-span-2">
          <input
            className="field"
            value={objek.namaObjek}
            onChange={(e) => onChange({ namaObjek: e.target.value })}
            placeholder="Contoh: Honda Revo 110 cc"
          />
        </Field>
        <Field label="NUP">
          <input
            className="field angka"
            value={objek.nup}
            onChange={(e) => onChange({ nup: e.target.value })}
            placeholder="Nomor Urut Pendaftaran"
          />
        </Field>

        <Field label="Lokasi objek (kota/kabupaten)">
          <input
            className="field"
            value={objek.lokasiObjek}
            onChange={(e) => onChange({ lokasiObjek: e.target.value })}
            placeholder="Contoh: Denpasar"
          />
        </Field>
        <Field label="Provinsi rencana penjualan">
          <select
            className="field"
            value={objek.provinsi}
            onChange={(e) => onChange({ provinsi: e.target.value })}
          >
            {PROVINSI.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="KPKNL rencana pelaksanaan lelang"
          hint="Seluruh KPKNL (71 kantor) dikelompokkan per provinsi."
        >
          <select
            className="field"
            value={objek.kpknl}
            onChange={(e) => onChange({ kpknl: e.target.value })}
          >
            <option value="">- Pilih KPKNL -</option>
            {objek.kpknl && !SEMUA_NAMA_KPKNL.has(objek.kpknl) ? (
              <option value={objek.kpknl}>{objek.kpknl}</option>
            ) : null}
            {KPKNL_PER_PROVINSI.map(([provinsi, daftar]) => (
              <optgroup key={provinsi} label={provinsi}>
                {daftar.map((k) => (
                  <option key={k.nama} value={k.nama}>
                    {k.nama}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>

        <Field
          label="Kategori lokasi objek"
          panduan={
            <PanduanButton
              judul="Kategori lokasi"
              isi={KUTIPAN.penyesuaianLokasi}
              contoh={
                <p className="text-xs">
                  Kategori 1: harga tertinggi; kategori 4: harga terendah.
                  Penentuan kategori per wilayah kerja KPKNL dianalisis Direktur
                  Penilaian setiap Januari dan Juli.
                </p>
              }
            />
          }
        >
          <select
            className="field"
            value={objek.kategoriLokasi}
            onChange={(e) =>
              onChange({ kategoriLokasi: Number(e.target.value) })
            }
          >
            {[1, 2, 3, 4].map((k) => (
              <option key={k} value={k}>
                Kategori {k}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Jenis kendaraan">
          <select
            className="field"
            value={objek.jenisKendaraan}
            onChange={(e) =>
              onChange({
                jenisKendaraan: e.target.value as Objek["jenisKendaraan"],
              })
            }
          >
            <option value="roda23">Roda 2 atau 3</option>
            <option value="roda4plus">Roda 4 atau lebih</option>
          </select>
        </Field>
        <Field label="Merek kendaraan">
          <input
            className="field"
            value={objek.merek}
            onChange={(e) => onChange({ merek: e.target.value })}
            placeholder="Contoh: Honda"
          />
        </Field>

        <Field label="Tipe kendaraan">
          <input
            className="field"
            value={objek.tipe}
            onChange={(e) => onChange({ tipe: e.target.value })}
            placeholder="Revo 110 cc"
          />
        </Field>
        <Field
          label="Kapasitas silinder (cc)"
          panduan={
            <PanduanButton
              judul="Klasifikasi kelas kendaraan"
              isi={KUTIPAN.klasifikasiCC}
            />
          }
          hint={
            kelas
              ? `Kelas: ${labelKelas(kelas)} - tarif penyesuaian tahun pembuatan ${TARIF_TAHUN_PEMBUATAN[kelas]}% per tahun`
              : "Isi cc untuk menentukan kelas low/middle/high-end"
          }
        >
          <input
            type="number"
            className="field angka"
            value={objek.cc ?? ""}
            min={0}
            onChange={(e) =>
              onChange({
                cc: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Tahun pembuatan">
          <input
            type="number"
            className="field angka"
            value={objek.tahunPembuatan}
            min={1900}
            max={2100}
            onChange={(e) =>
              onChange({ tahunPembuatan: Number(e.target.value) || 0 })
            }
          />
        </Field>

        <Field label="Warna">
          <input
            className="field"
            value={objek.warna}
            onChange={(e) => onChange({ warna: e.target.value })}
          />
        </Field>
        <Field label="Bahan bakar">
          <select
            className="field"
            value={objek.bahanBakar}
            onChange={(e) => onChange({ bahanBakar: e.target.value })}
          >
            <option>Bensin</option>
            <option>Solar</option>
            <option>Listrik</option>
            <option>Lainnya</option>
          </select>
        </Field>
        <Field
          label="Kondisi/tingkat kerusakan"
          hint={`Faktor kondisi diterapkan: ${faktor
            .toString()
            .replace(".", ",")}`}
        >
          <select
            className="field"
            value={objek.tingkatKerusakan}
            onChange={(e) =>
              onChange({
                tingkatKerusakan: e.target
                  .value as Objek["tingkatKerusakan"],
              })
            }
          >
            {(Object.keys(
              tujuan === "lelang" ? LABEL_TINGKAT : LABEL_TINGKAT_TANPA_LELANG
            ) as Objek["tingkatKerusakan"][]).map((t) => (
              <option key={t} value={t}>
                {tujuan === "lelang" ? LABEL_TINGKAT[t] : LABEL_TINGKAT_TANPA_LELANG[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nomor polisi">
          <input
            className="field"
            value={objek.nomorPolisi}
            onChange={(e) => onChange({ nomorPolisi: e.target.value })}
            placeholder="xx xxxx xx"
          />
        </Field>
        <Field label="Dokumen kepemilikan" hint="Dapat dicentang lebih dari satu.">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-garis bg-white px-3 py-2">
            {DOKUMEN_KEPEMILIKAN.map((d) => (
              <label
                key={d}
                className="flex cursor-pointer items-center gap-1.5 text-sm text-tinta-900"
              >
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 accent-tinta"
                  checked={objek.dokumen.includes(d)}
                  onChange={() => ubahDokumen(d)}
                />
                {d}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Pemilik dokumen">
          <input
            className="field"
            value={objek.pemilikDokumen}
            onChange={(e) => onChange({ pemilikDokumen: e.target.value })}
            placeholder="Nama Kementerian/Lembaga"
          />
        </Field>

        <Field label="Masa berlaku dokumen">
          <select
            className="field"
            value={objek.masaBerlaku}
            onChange={(e) =>
              onChange({ masaBerlaku: e.target.value as Objek["masaBerlaku"] })
            }
          >
            <option value="Masih berlaku">Masih berlaku</option>
            <option value="Habis masa berlaku">Habis masa berlaku</option>
          </select>
        </Field>
        <Field label="Penggunaan kendaraan">
          <input
            className="field"
            value={objek.penggunaan}
            onChange={(e) => onChange({ penggunaan: e.target.value })}
            placeholder="Contoh: Kendaraan Dinas"
          />
        </Field>
        <Field label="Keterangan lain">
          <input
            className="field"
            value={objek.keteranganLain}
            onChange={(e) => onChange({ keteranganLain: e.target.value })}
            placeholder="Opsional"
          />
        </Field>
      </div>

      {tujuan === "lelang" && !punyaDokumen ? (
        <div className="mt-4 rounded-[2px] border border-stempel/40 bg-stempel-soft px-4 py-3 text-xs text-stempel leading-relaxed">
          Objek tidak didukung dokumen kepemilikan. Untuk penjualan lelang,
          faktor pengali yang diterapkan adalah 0,5 (menggantikan 0,6 atau 0,7).
          {` `}
          {KUTIPAN.faktorKondisiLelang}
        </div>
      ) : null}

      <div className="mt-3">
        <Catatan>
          Klasifikasi cc menentukan tarif penyesuaian tahun pembuatan (5% / 7% /
          10%). Penyesuaian lokasi mengikuti kategori lokasi objek versus lokasi
          lelang pembanding.
        </Catatan>
      </div>
    </section>
  );
}
