"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { SatkerSection } from "./SatkerSection";
import { PanitiaSection } from "./PanitiaSection";
import { ObjekSection } from "./ObjekSection";
import { LelangSection } from "./LelangSection";
import { PenyesuaianSection } from "./PenyesuaianSection";
import { MerekSection } from "./MerekSection";
import { RekapPanel } from "./RekapPanel";
import { Modal } from "./fields";
import { PengaturanAkun } from "./PengaturanAkun";
import { KertasKerja } from "@/components/cetak/KertasKerja";
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
  ProfilSatker,
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

export function EditorApp({ profil }: { profil: ProfilSatker }) {
  const [profilAktif, setProfilAktif] = useState<ProfilSatker>(profil);
  const [dokumen, setDokumen] = useState<Dokumen | null>(null);
  const [status, setStatus] = useState<StatusSimpan>({
    mode: "idle",
    teks: "Draf tersimpan otomatis di perangkat",
  });
  const [sibuk, setSibuk] = useState(false);
  const [bukaPreview, setBukaPreview] = useState(false);
  const [bukaDokumen, setBukaDokumen] = useState(false);
  const [bukaPengaturan, setBukaPengaturan] = useState(false);
  const [pdfLihat, setPdfLihat] = useState<{ url: string; nama: string } | null>(
    null
  );

  useEffect(() => {
    let dasar: Dokumen;
    try {
      const tersimpan = localStorage.getItem(KUNCI_DRAF);
      dasar = tersimpan
        ? normalisasiDokumen(JSON.parse(tersimpan))
        : dokumenBaru();
    } catch {
      /* abaikan draft rusak */
      dasar = dokumenBaru();
    }
    setDokumen({
      ...dasar,
      satker: {
        ...dasar.satker,
        namaKementerian:
          dasar.satker.namaKementerian || profil.namaKementerian,
        namaSatker: dasar.satker.namaSatker || profil.namaSatker,
        logoDataUrl: profil.logoDataUrl || dasar.satker.logoDataUrl,
      },
    });
    // Profil berasal dari sesi login dan tidak berubah selama sesi berjalan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setDokumen({
      ...dokumenBaru(),
      satker: {
        logoDataUrl: profilAktif.logoDataUrl,
        namaKementerian: profilAktif.namaKementerian,
        namaSatker: profilAktif.namaSatker,
        nomorKertasKerja: "",
        tujuan: "lelang",
      },
    });
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

  const cetakPdf = () => {
    if (!dokumen) return;
    const judulSebelumnya = document.title;
    const pulihkanJudul = () => {
      document.title = judulSebelumnya;
    };
    document.title = namaFilePdf(dokumen).replace(/\.pdf$/i, "");
    window.addEventListener("afterprint", pulihkanJudul, { once: true });
    window.print();
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
    <div className="min-h-screen screen-editor">
      <header className="sticky top-0 z-40 bg-tinta-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 lg:px-8">
          <div className="mr-auto">
            <p className="font-serif font-bold leading-tight">
              Kalkulator Nilai Taksiran BMN
            </p>
            <p className={`text-[11px] ${statusWarna}`}>{status.teks}</p>
          </div>
          <span
            className="hidden max-w-[280px] truncate text-xs text-white/70 md:block"
            title={`${profilAktif.namaSatker} (${profilAktif.kodeSatker})`}
          >
            Rahajeng Rauh, {profilAktif.namaSatker}
          </span>
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
            className="tombol tombol-garis text-xs"
            onClick={() => setBukaPengaturan(true)}
          >
            Pengaturan
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

      {profilAktif.mustChangePassword ? (
        <div className="border-b border-kuningan/40 bg-kuningan/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-xs text-tinta-900 lg:px-8">
            <span>
              Anda masih menggunakan kata sandi bawaan. Demi keamanan, ganti
              kata sandi melalui menu Pengaturan.
            </span>
            <button
              type="button"
              className="font-semibold text-tinta-700 underline decoration-dotted underline-offset-2"
              onClick={() => setBukaPengaturan(true)}
            >
              Buka Pengaturan
            </button>
          </div>
        </div>
      ) : null}

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
            onCetakPdf={cetakPdf}
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

      <Modal
        buka={bukaPreview}
        tutup={() => setBukaPreview(false)}
        judul="Pratinjau Kertas Kerja"
        lebar="max-w-4xl"
      >
        <div className="max-h-[75vh] overflow-auto border border-garis bg-white">
          <div
            className="mx-auto"
            style={{
              width: "210mm",
              padding: "12mm",
              boxSizing: "border-box",
            }}
          >
            <KertasKerja dok={dokumen} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="tombol tombol-utama"
            onClick={cetakPdf}
            disabled={sibuk}
          >
            Cetak / Simpan PDF
          </button>
        </div>
        <p className="mt-3 text-right text-[11px] text-abu">
          Pada dialog cetak, pilih “Simpan sebagai PDF”, ukuran A4, skala 100%,
          dan matikan header/footer browser bila tersedia.
        </p>
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
          &quot;Simpan&quot; atau &quot;Cetak / Simpan PDF&quot; pada aplikasi ini.
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
      <PengaturanAkun
        buka={bukaPengaturan}
        tutup={() => setBukaPengaturan(false)}
        profil={profilAktif}
        onLogoBerubah={(logoDataUrl) => {
          setProfilAktif((p) => ({ ...p, logoDataUrl }));
          updateSatker({ logoDataUrl });
        }}
        onSandiBerubah={() => {
          setProfilAktif((p) => ({ ...p, mustChangePassword: false }));
        }}
      />

      <div className="print-area" aria-hidden="true">
        <KertasKerja dok={dokumen} />
      </div>
    </div>
  );
}
