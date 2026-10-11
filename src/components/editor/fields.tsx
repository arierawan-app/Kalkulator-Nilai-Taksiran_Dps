"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { formatAngka } from "@/lib/format";

export function Modal({
  buka,
  tutup,
  judul,
  children,
  lebar = "max-w-2xl",
}: {
  buka: boolean;
  tutup: () => void;
  judul: string;
  children: ReactNode;
  lebar?: string;
}) {
  useEffect(() => {
    if (!buka) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [buka, tutup]);

  if (!buka) return null;
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-tinta-900/45 p-4 sm:p-8"
      onClick={tutup}
      role="presentation"
    >
      <div
        className={`mx-auto w-full ${lebar} bg-white border border-garis shadow-xl`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={judul}
      >
        <div className="flex items-center justify-between border-b border-garis px-5 py-3">
          <h3 className="font-serif font-bold text-tinta-900">{judul}</h3>
          <button
            type="button"
            className="tombol tombol-garis px-2.5 py-1 text-xs"
            onClick={tutup}
          >
            Tutup
          </button>
        </div>
        <div className="px-5 py-4 text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function PanduanButton({
  judul,
  isi,
  contoh,
}: {
  judul: string;
  isi: string;
  contoh?: ReactNode;
}) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setBuka(true)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-tinta-700 underline decoration-dotted underline-offset-2 hover:text-tinta"
        title={`Ketentuan: ${judul}`}
      >
        ketentuan
      </button>
      <Modal buka={buka} tutup={() => setBuka(false)} judul={judul}>
        <p className="text-tinta-900">{isi}</p>
        {contoh ? (
          <div className="mt-4 border-t border-garis-2 pt-3">{contoh}</div>
        ) : null}
      </Modal>
    </>
  );
}

export function Field({
  label,
  panduan,
  hint,
  children,
  className = "",
}: {
  label: string;
  panduan?: ReactNode;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="label mb-1">{label}</span>
        {panduan}
      </div>
      {children}
      {hint ? <p className="text-[11px] text-abu mt-1">{hint}</p> : null}
    </div>
  );
}

export function Catatan({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-abu leading-relaxed border-l-2 border-kuningan/60 pl-3">
      {children}
    </p>
  );
}

export function Peringatan({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-stempel leading-relaxed border-l-2 border-stempel pl-3">
      {children}
    </p>
  );
}

export function InputRupiah({
  nilai,
  onNilai,
  className = "field angka",
  placeholder,
}: {
  nilai: number;
  onNilai: (nilai: number) => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const ubah = (e: ChangeEvent<HTMLInputElement>) => {
    const teks = e.target.value;
    const posisiKursor = e.target.selectionStart ?? teks.length;
    const digitSebelumKursor = teks
      .slice(0, posisiKursor)
      .replace(/\D/g, "").length;
    const angka = Number(teks.replace(/\D/g, "")) || 0;
    onNilai(angka);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      if (digitSebelumKursor === 0) {
        el.setSelectionRange(0, 0);
        return;
      }
      const hasil = el.value;
      let hitung = 0;
      for (let i = 0; i < hasil.length; i++) {
        if (/\d/.test(hasil[i])) {
          hitung += 1;
          if (hitung === digitSebelumKursor) {
            el.setSelectionRange(i + 1, i + 1);
            return;
          }
        }
      }
      el.setSelectionRange(hasil.length, hasil.length);
    });
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={className}
      placeholder={placeholder}
      value={nilai ? formatAngka(nilai) : ""}
      onChange={ubah}
    />
  );
}
