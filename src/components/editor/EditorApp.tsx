"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { SatkerSection } from "./SatkerSection";
import { PanitiaSection } from "./PanitiaSection";
import { ObjekSection } from "./ObjekSection";
import { LelangSection } from "./LelangSection";
import { PenyesuaianSection } from "./PenyesuaianSection";
import { MerekSection } from "./MerekSection";
import { RekapPanel } from "./RekapPanel";
import { Modal } from "./fields";
import { KertasKerja } from "@/components/cetak/KertasKerja";
import { buatBlobPdf } from "@/components/cetak/pdf";
import {
  BERKAS_JSON,
  BERKAS_PDF,
  bukaBerkasLokal,
  simpanBlobLokal,
} from "@/lib/berkas-lokal";
import {
  barisLelangKosong,
  dokumenBaru,
  merekRowKosong,
  namaFileDokumen,
  namaFilePdf,
  normalisasiDokumen,
} from "@/lib/dokumen";
import { validasiDokumen } from "@/lib/validasi";
import type {
  Dokumen,
  LelangRow,
  MerekRow,
  Objek,
  Panitia,
  Satker,
} from "@/lib/types";
import kpknlData from "@/data/kpknl.json";
import type { Kpknl } from "@/lib/types";

const DAFTAR_KPKNL = kpknlData as Kpknl[];
const KUNCI_DRAF = "knt-dokumen-v1";

type StatusSimpan = {
  mode: "idle" | "saving" | "saved" | "error";
  teks: string;
};

export function EditorApp({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName: string;
}) {
  const [dokumen, setDokumen] = useState<Dokumen | null>(null);
  const [status, setStatus] = useState<StatusSimpan>({
    mode: "idle",
    teks: "Draf tersimpan otomatis di perangkat",
  });
  const [sibuk, setSibuk] = useState(false);
  const [bukaPreview, setBukaPreview] = useState(false);
  const [bukaDokumen, setBukaDokumen] = useState(false);
  const [pdfLihat, setPdfLihat] = useState<{ url: string; nama: string } | null>(
    null
  );

  const lembar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem(KUNCI_DRAF);
      if (tersimpan) {
        setDokumen(normalisasiDokumen(JSON.parse(tersimpan)));
        return;
      }
    } catch {
      /* abaikan draft rusak */
    }
    setDokumen(dokumenBaru());
  }, []);

  useEffect(() => {
    if (!dokumen) return;
    try {
      localStorage.setItem(KUNCI_DRAF, JSON.stringify(dokumen));
    } catch {
      /* penyimpanan penuh */
    }
  }, [dokumen]);

  const ubah = useCallback((fn: (d: Dokumen) => Dokumen) => {
    setDokumen((d) => (d ? fn(d) : d));
  }, []);

  const updateSatker = useCallback(
    (patch: Partial<Satker>) => ubah((d) => ({ ...d, satker: { ...d.satker, ...patch } })),
    [ubah]
  );
  const updatePanitia = useCallback(
    (patch: Partial<Panitia>) => ubah((d) => ({ ...d, panitia: { ...d.panitia, ...patch } })),
    [ubah]
  );
  const updateObjek = useCallback(
    (patch: Partial<Objek>) => ubah((d) => ({ ...d, objek: { ...d.objek, ...patch } })),
    [ubah]
  );
  const setTahunPenilaian = useCallback(
    (tahun: number) => ubah((d) => ({ ...d, tahunPenilaian: tahun })),
    [ubah]
  );
  const updateLelangRow = useCallback(
    (id: string, patch: Partial<LelangRow>) =>
      ubah((d) => ({
        ...d,
        lelang: d.lelang.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      })),
    [ubah]
  );
  const tambahLelang = useCallback(
    () =>
      ubah((d) => ({
        ...d,
        lelang: [
          ...d.lelang,
          barisLelangKosong(d.tahunPenilaian, d.objek.tahunPembuatan),
        ],
      })),
    [ubah]
  );
  const hapusLelang = useCallback(
    (id: string) => ubah((d) => ({ ...d, lelang: d.lelang.filter((r) => r.id !== id) })),
    [ubah]
  );
  const updateMerekRow = useCallback(
    (id: string, patch: Partial<MerekRow>) =>
      ubah((d) => ({
        ...d,
        merek: d.merek.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    [ubah]
  );
  const tambahMerek = useCallback(
    () =>
      ubah((d) => ({
        ...d,
        merek: [
          ...d.merek,
          merekRowKosong(d.merek.some((m) => m.peran === "NJT") ? "NJP" : "NJT"),
        ],
      })),
    [ubah]
  );
  const hapusMerek = useCallback(
    (id: string) => ubah((d) => ({ ...d, merek: d.merek.filter((m) => m.id !== id) })),
    [ubah]
  );
  const terapkanFpm = useCallback(
    (merek: string, fpm: number) => {
      let ketemu = 0;
      ubah((d) => ({
        ...d,
        lelang: d.lelang.map((r) => {
          if (r.merek.trim().toLowerCase() === merek.trim().toLowerCase()) {
            ketemu += 1;
            return { ...r, adjMerek: fpm };
          }
          return r;
        }),
      }));
      setTimeout(() => {
        if (ketemu === 0) {
          alert(
            `Tidak ada data lelang dengan merek "${merek}". Isi kolom Merek pada baris data lelang terlebih dahulu.`
          );
        }
      }, 0);
    },
    [ubah]
  );

  const temuan = useMemo(
    () => (dokumen ? validasiDokumen(dokumen) : []),
    [dokumen]
  );

  const dokumenBaruHandler = () => {
    if (
      !confirm(
        "Mulai dokumen baru? Draf saat ini akan diganti. Simpan ke berkas terlebih dahulu bila masih diperlukan."
      )
    )
      return;
    setDokumen(dokumenBaru());
    setStatus({ mode: "idle", teks: "Dokumen baru • draf tersimpan otomatis di perangkat" });
  };

  const simpanKeBerkas = async () => {
    if (!dokumen) return;
    setSibuk(true);
    setStatus({ mode: "saving", teks: "Menyimpan ke perangkat..." });
    try {
      const dokTerbaru: Dokumen = {
        ...dokumen,
        updatedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(dokTerbaru, null, 2)], {
        type: "application/json",
      });
      const hasil = await simpanBlobLokal(blob, namaFileDokumen(dokTerbaru), BERKAS_JSON);
      if (!hasil) {
        setStatus({ mode: "idle", teks: "Penyimpanan dibatalkan" });
        return;
      }
      setDokumen(dokTerbaru);
      if (hasil.metode === "unduhan") {
        alert(
          `Browser ini belum mendukung pemilihan lokasi penyimpanan. Berkas diunduh sebagai "${hasil.nama}".`
        );
      }
      setStatus({
        mode: "saved",
        teks:
          hasil.metode === "pilih-lokasi"
            ? `Tersimpan: ${hasil.nama}`
            : `Terunduh: ${hasil.nama}`,
      });
    } catch {
      setStatus({ mode: "error", teks: "Gagal menyimpan - draf aman di perangkat" });
    } finally {
      setSibuk(false);
    }
  };

  const bukaDokumenJson = async () => {
    try {
      const file = await bukaBerkasLokal(BERKAS_JSON);
      if (!file) return;
      const isi = JSON.parse(await file.text());
      setDokumen(normalisasiDokumen(isi));
      setBukaDokumen(false);
      setStatus({ mode: "saved", teks: `Dibuka: ${file.name}` });
    } catch {
      alert("Gagal membuka dokumen. Pilih berkas JSON yang disimpan dari aplikasi ini.");
    }
  };

  const tutupPdf = useCallback(() => {
    setPdfLihat((lama) => {
      if (lama) URL.revokeObjectURL(lama.url);
      return null;
    });
  }, []);

  const bukaPdf = async () => {
    try {
      const file = await bukaBerkasLokal(BERKAS_PDF);
      if (!file) return;
      setPdfLihat((lama) => {
        if (lama) URL.revokeObjectURL(lama.url);
        return { url: URL.createObjectURL(file), nama: file.name };
      });
      setBukaDokumen(false);
    } catch {
      alert("Gagal membuka berkas PDF.");
    }
  };

  const pastikanBlob = async (): Promise<Blob | null> => {
    if (!dokumen || !lembar.current) return null;
    return buatBlobPdf(lembar.current, namaFilePdf(dokumen));
  };

  const simpanPdf = async () => {
    if (!dokumen) return;
    setSibuk(true);
    try {
      const blob = await pastikanBlob();
      if (!blob) return;
      const hasil = await simpanBlobLokal(blob, namaFilePdf(dokumen), BERKAS_PDF);
      if (!hasil) return;
      if (hasil.metode === "unduhan") {
        alert(
          `Browser ini belum mendukung pemilihan lokasi penyimpanan. PDF diunduh sebagai "${hasil.nama}".`
        );
      }
      setStatus({
        mode: "saved",
        teks:
          hasil.metode === "pilih-lokasi"
            ? `PDF tersimpan: ${hasil.nama}`
            : `PDF terunduh: ${hasil.nama}`,
      });
    } catch {
      alert("Gagal membuat atau menyimpan PDF. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  };

  if (!dokumen) {
    return (
      <main className="min-h-screen flex items-center justify-center text-abu text-sm">
        Memuat kertas kerja...
      </main>
    );
  }

  const statusWarna =
    status.mode === "error"
      ? "text-stempel-soft"
      : status.mode === "saving"
        ? "text-kuningan-soft"
        : "text-white/80";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-tinta-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
          <div className="mr-auto">
            <p className="font-serif font-bold leading-tight">
              Kalkulator Nilai Taksiran BMN
            </p>
            <p className={`text-[11px] ${statusWarna}`}>{status.teks}</p>
          </div>
          <span className="hidden text-xs text-white/70 md:block">{userName || userEmail}</span>
          <button
            type="button"
            className="tombol tombol-garis text-xs"
            onClick={() => setBukaDokumen(true)}
          >
            Buka dokumen
          </button>
          <button
            type="button"
            className="tombol tombol-garis text-xs"
            onClick={dokumenBaruHandler}
          >
            Dokumen baru
          </button>
          <button
            type="button"
            className="tombol tombol-garis text-xs"
            onClick={() => void simpanKeBerkas()}
            disabled={sibuk}
          >
            Simpan
          </button>
          <button
            type="button"
            className="tombol text-xs text-white/80 hover:text-white"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:px-8">
        <div className="space-y-8">
          <SatkerSection satker={dokumen.satker} onChange={updateSatker} />
          <PanitiaSection
            panitia={dokumen.panitia}
            tahunPenilaian={dokumen.tahunPenilaian}
            onChange={updatePanitia}
            onChangeTahunPenilaian={setTahunPenilaian}
          />
          <ObjekSection
            objek={dokumen.objek}
            tujuan={dokumen.satker.tujuan}
            onChange={updateObjek}
          />
          <LelangSection
            dok={dokumen}
            onChangeRow={updateLelangRow}
            onTambah={tambahLelang}
            onHapus={hapusLelang}
          />
          <PenyesuaianSection dok={dokumen} onChangeRow={updateLelangRow} />
          <MerekSection
            dok={dokumen}
            onChangeRow={updateMerekRow}
            onTambah={tambahMerek}
            onHapus={hapusMerek}
            onTerapkanFpm={terapkanFpm}
          />
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <RekapPanel
            dok={dokumen}
            temuan={temuan}
            sibuk={sibuk}
            onPreview={() => setBukaPreview(true)}
            onSimpanPdf={() => void simpanPdf()}
            onBukaPdf={() => void bukaPdf()}
          />
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 lg:px-8">
        <p className="text-[11px] text-abu leading-relaxed border-t border-garis pt-4">
          Data kertas kerja disimpan di perangkat Anda sendiri (komputer/laptop
          yang digunakan) dan tidak dikirim ke server. Nilai taksiran berlaku 6
          bulan sejak tanggal penentuan. Pastikan seluruh isian sesuai
          ketentuan Tata Cara Penentuan Nilai Taksiran BMN sebelum
          ditandatangani.
        </p>
      </footer>

      <datalist id="daftar-kpknl">
        {DAFTAR_KPKNL.map((k) => (
          <option key={k.nama} value={k.nama}>
            {k.provinsi}
          </option>
        ))}
      </datalist>

      <div
        aria-hidden
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          zIndex: -1,
        }}
      >
        <div ref={lembar}>
          <KertasKerja dok={dokumen} />
        </div>
      </div>

      <Modal
        buka={bukaPreview}
        tutup={() => setBukaPreview(false)}
        judul="Pratinjau Kertas Kerja"
        lebar="max-w-4xl"
      >
        <div className="max-h-[75vh] overflow-auto border border-garis bg-white">
          <div className="mx-auto" style={{ width: "210mm" }}>
            <KertasKerja dok={dokumen} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="tombol tombol-utama"
            onClick={() => void simpanPdf()}
            disabled={sibuk}
          >
            Simpan PDF
          </button>
        </div>
      </Modal>

      <Modal
        buka={bukaDokumen}
        tutup={() => setBukaDokumen(false)}
        judul="Buka dokumen dari perangkat"
      >
        <p className="text-abu">
          Pilih jenis berkas yang ingin dibuka. Berkas data isian (.json)
          dikembalikan ke formulir, sedangkan PDF ditampilkan pada penampil
          PDF.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="tombol tombol-utama justify-center"
            onClick={() => void bukaDokumenJson()}
          >
            Buka data isian (.json)
          </button>
          <button
            type="button"
            className="tombol tombol-garis justify-center"
            onClick={() => void bukaPdf()}
          >
            Buka PDF (penampil)
          </button>
        </div>
        <p className="mt-4 text-[11px] text-abu leading-relaxed">
          Pastikan berkas sebelumnya telah disimpan melalui tombol
          &quot;Simpan&quot; atau &quot;Simpan PDF&quot; pada aplikasi ini.
        </p>
      </Modal>

      <Modal
        buka={pdfLihat !== null}
        tutup={tutupPdf}
        judul={pdfLihat ? `PDF: ${pdfLihat.nama}` : "Penampil PDF"}
        lebar="max-w-5xl"
      >
        {pdfLihat ? (
          <iframe
            src={pdfLihat.url}
            title={pdfLihat.nama}
            className="h-[75vh] w-full border border-garis bg-white"
          />
        ) : null}
      </Modal>
    </div>
  );
}
