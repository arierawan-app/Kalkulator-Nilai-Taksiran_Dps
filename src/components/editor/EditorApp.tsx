"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import { SatkerSection } from "./SatkerSection";
import { PanitiaSection } from "./PanitiaSection";
import { ObjekSection } from "./ObjekSection";
import { LelangSection } from "./LelangSection";
import { PenyesuaianSection } from "./PenyesuaianSection";
import { MerekSection } from "./MerekSection";
import { RekapPanel } from "./RekapPanel";
import { Modal } from "./fields";
import { KertasKerja } from "@/components/cetak/KertasKerja";
import { buatBlobPdf, unduhBlob } from "@/components/cetak/pdf";
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

type BerkasDrive = {
  id: string;
  name?: string;
  modifiedTime?: string;
};

export function EditorApp({
  userEmail,
  userName,
  sessionError,
}: {
  userEmail: string;
  userName: string;
  sessionError?: "RefreshTokenError";
}) {
  const [dokumen, setDokumen] = useState<Dokumen | null>(null);
  const [status, setStatus] = useState<StatusSimpan>({
    mode: "idle",
    teks: "Draf tersimpan di perangkat",
  });
  const [butuhLoginUlang, setButuhLoginUlang] = useState(
    sessionError === "RefreshTokenError"
  );
  const [sibuk, setSibuk] = useState(false);
  const [bukaPreview, setBukaPreview] = useState(false);
  const [bukaDokumen, setBukaDokumen] = useState(false);

  const kotor = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const simpanKeDrive = useCallback(async (dok: Dokumen) => {
    setStatus({ mode: "saving", teks: "Menyimpan ke Drive..." });
    try {
      const res = await fetch("/api/drive/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: dok.fileId,
          namaFile: namaFileDokumen(dok),
          dokumen: { ...dok, updatedAt: new Date().toISOString() },
        }),
      });
      if (res.status === 401) {
        setButuhLoginUlang(true);
        setStatus({ mode: "error", teks: "Sesi Google berakhir" });
        return;
      }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { fileId?: string };
      if (data.fileId && data.fileId !== dok.fileId) {
        setDokumen((d) => (d ? { ...d, fileId: data.fileId } : d));
      }
      const jam = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setButuhLoginUlang(false);
      setStatus({ mode: "saved", teks: `Tersimpan di Drive ${jam}` });
    } catch {
      setStatus({
        mode: "error",
        teks: "Gagal menyimpan ke Drive - draf aman di perangkat",
      });
    }
  }, []);

  useEffect(() => {
    if (!dokumen || !kotor.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!kotor.current) return;
      kotor.current = false;
      void simpanKeDrive(dokumen);
    }, 2500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [dokumen, simpanKeDrive]);

  const ubah = useCallback((fn: (d: Dokumen) => Dokumen) => {
    kotor.current = true;
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
    if (!confirm("Mulai dokumen baru? Draf saat ini tetap tersimpan di Drive dan perangkat.")) return;
    kotor.current = false;
    setDokumen(dokumenBaru());
    setStatus({ mode: "idle", teks: "Dokumen baru" });
  };

  const bukaDariDrive = async (fileId: string) => {
    try {
      const res = await fetch(`/api/drive/documents/${fileId}`);
      if (res.status === 401) {
        setButuhLoginUlang(true);
        return;
      }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { dokumen: unknown };
      const dok = normalisasiDokumen(data.dokumen);
      dok.fileId = fileId;
      kotor.current = false;
      setButuhLoginUlang(false);
      setDokumen(dok);
      setBukaDokumen(false);
      setStatus({ mode: "saved", teks: "Dokumen dibuka dari Drive" });
    } catch {
      alert("Gagal membuka dokumen dari Drive.");
    }
  };

  const pastikanBlob = async (): Promise<Blob | null> => {
    if (!dokumen || !lembar.current) return null;
    return buatBlobPdf(lembar.current, namaFilePdf(dokumen));
  };

  const unduhPdf = async () => {
    if (!dokumen) return;
    setSibuk(true);
    try {
      const blob = await pastikanBlob();
      if (blob) unduhBlob(blob, namaFilePdf(dokumen));
    } catch {
      alert("Gagal membuat PDF. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  };

  const simpanPdfKeDrive = async () => {
    if (!dokumen) return;
    setSibuk(true);
    try {
      const blob = await pastikanBlob();
      if (!blob) return;
      const nama = namaFilePdf(dokumen);
      const form = new FormData();
      form.append("file", new File([blob], nama, { type: "application/pdf" }));
      form.append("nama", nama);
      const res = await fetch("/api/drive/pdf", { method: "POST", body: form });
      if (res.status === 401) {
        setButuhLoginUlang(true);
        return;
      }
      if (!res.ok) throw new Error();
      alert(
        "PDF tersimpan pada folder \"Kalkulator Nilai Taksiran\" di Google Drive Anda."
      );
    } catch {
      alert("Gagal menyimpan PDF ke Drive.");
    } finally {
      setSibuk(false);
    }
  };

  const cobaLagi = async () => {
    setStatus({ mode: "saving", teks: "Menyambungkan ulang..." });
    try {
      const res = await fetch("/api/drive/documents");
      if (!res.ok) {
        setButuhLoginUlang(true);
        setStatus({
          mode: "error",
          teks: "Masih terputus - silakan masuk ulang dengan Google",
        });
        return;
      }
      setButuhLoginUlang(false);
      setStatus({ mode: "saved", teks: "Terhubung kembali ke Google Drive" });
      if (dokumen) void simpanKeDrive(dokumen);
    } catch {
      setStatus({ mode: "error", teks: "Tidak dapat menghubungi server" });
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
            onClick={() => {
              kotor.current = false;
              void simpanKeDrive(dokumen);
            }}
          >
            Simpan ke Drive
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

      {butuhLoginUlang ? (
        <div className="border-b border-stempel/30 bg-stempel-soft px-4 py-2 text-xs text-stempel">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 lg:px-6">
            <span className="mr-auto py-1">
              Koneksi Google Drive terputus. Draf aman di perangkat ini.
            </span>
            <button
              type="button"
              className="tombol tombol-garis px-2.5 py-1 text-xs"
              onClick={() => void cobaLagi()}
            >
              Coba sambungkan ulang
            </button>
            <button
              type="button"
              className="tombol tombol-stempel px-2.5 py-1 text-xs"
              onClick={() => void signIn("google", { redirectTo: "/editor" })}
            >
              Masuk ulang dengan Google
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
            onUnduh={() => void unduhPdf()}
            onSimpanDrive={() => void simpanPdfKeDrive()}
          />
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-10 lg:px-8">
        <p className="text-[11px] text-abu leading-relaxed border-t border-garis pt-4">
          Data disimpan pada folder &quot;Kalkulator Nilai Taksiran&quot; di
          Google Drive akun {userEmail}. Nilai taksiran berlaku 6 bulan sejak
          tanggal penentuan. Pastikan seluruh isian sesuai ketentuan Tata Cara
          Penentuan Nilai Taksiran BMN sebelum ditandatangani.
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
            className="tombol tombol-garis"
            onClick={() => void unduhPdf()}
            disabled={sibuk}
          >
            Unduh PDF
          </button>
          <button
            type="button"
            className="tombol tombol-utama"
            onClick={() => void simpanPdfKeDrive()}
            disabled={sibuk}
          >
            Simpan PDF ke Drive
          </button>
        </div>
      </Modal>

      <ModalDokumen
        buka={bukaDokumen}
        tutup={() => setBukaDokumen(false)}
        fileIdAktif={dokumen.fileId}
        onBuka={bukaDariDrive}
        onSesiHilang={() => setButuhLoginUlang(true)}
      />
    </div>
  );
}

function ModalDokumen({
  buka,
  tutup,
  fileIdAktif,
  onBuka,
  onSesiHilang,
}: {
  buka: boolean;
  tutup: () => void;
  fileIdAktif?: string;
  onBuka: (fileId: string) => void;
  onSesiHilang: () => void;
}) {
  const [daftar, setDaftar] = useState<BerkasDrive[] | null>(null);
  const [galat, setGalat] = useState("");

  useEffect(() => {
    if (!buka) return;
    setDaftar(null);
    setGalat("");
    void (async () => {
      try {
        const res = await fetch("/api/drive/documents");
        if (res.status === 401) {
          onSesiHilang();
          tutup();
          return;
        }
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { files?: BerkasDrive[] };
        setDaftar(data.files ?? []);
      } catch {
        setGalat("Gagal memuat daftar dokumen dari Drive.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buka]);

  const hapus = async (id: string, nama?: string) => {
    if (!confirm(`Hapus dokumen "${nama ?? id}" dari Drive?`)) return;
    try {
      const res = await fetch(`/api/drive/documents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setDaftar((d) => d?.filter((f) => f.id !== id) ?? d);
    } catch {
      alert("Gagal menghapus dokumen.");
    }
  };

  return (
    <Modal buka={buka} tutup={tutup} judul="Dokumen tersimpan di Drive">
      {galat ? <p className="text-stempel text-sm">{galat}</p> : null}
      {daftar === null && !galat ? (
        <p className="text-abu text-sm">Memuat...</p>
      ) : null}
      {daftar && daftar.length === 0 ? (
        <p className="text-abu text-sm">
          Belum ada dokumen pada folder &quot;Kalkulator Nilai Taksiran&quot;.
          Dokumen akan muncul setelah penyimpanan otomatis pertama.
        </p>
      ) : null}
      {daftar && daftar.length > 0 ? (
        <ul className="divide-y divide-garis-2">
          {daftar.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-2">
              <div className="mr-auto min-w-0">
                <p className="text-sm text-tinta-900 truncate">
                  {f.name?.replace(/\.json$/i, "")}
                </p>
                <p className="text-[11px] text-abu">
                  {f.modifiedTime
                    ? `Diperbarui ${new Date(f.modifiedTime).toLocaleString("id-ID")}`
                    : ""}
                  {f.id === fileIdAktif ? " - dokumen aktif" : ""}
                </p>
              </div>
              <button
                type="button"
                className="tombol tombol-garis text-xs"
                onClick={() => onBuka(f.id)}
              >
                Buka
              </button>
              <button
                type="button"
                className="text-xs text-stempel underline decoration-dotted"
                onClick={() => void hapus(f.id, f.name)}
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </Modal>
  );
}
