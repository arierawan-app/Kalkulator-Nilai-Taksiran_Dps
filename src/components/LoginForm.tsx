"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Field } from "./editor/fields";
import { normalisasiKodeSatker } from "@/lib/satker";

export function LoginForm() {
  const router = useRouter();
  const [kode, setKode] = useState("");
  const [sandi, setSandi] = useState("");
  const [tampilkanSandi, setTampilkanSandi] = useState(false);
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);

  const kirim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGalat("");
    const kodeBersih = normalisasiKodeSatker(kode);
    if (!kodeBersih || !sandi) {
      setGalat("Isi Kode Satker dan kata sandi terlebih dahulu.");
      return;
    }
    setSibuk(true);
    try {
      const hasil = await signIn("credentials", {
        kode: kodeBersih,
        sandi,
        redirect: false,
      });
      if (hasil?.error) {
        setGalat("Kode Satker atau kata sandi salah.");
        setSibuk(false);
        return;
      }
      router.replace("/editor");
      router.refresh();
    } catch {
      setGalat("Tidak dapat terhubung ke server. Coba lagi.");
      setSibuk(false);
    }
  };

  return (
    <form className="mt-6" onSubmit={kirim} noValidate>
      <div className="space-y-4">
        <Field label="Kode Satker (nama pengguna)">
          <input
            className="field angka"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="20 Digit Kode Satker"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            required
          />
        </Field>
        <Field label="Kata Sandi">
          <div className="relative">
            <input
              type={tampilkanSandi ? "text" : "password"}
              className="field pr-10"
              value={sandi}
              onChange={(e) => setSandi(e.target.value)}
              placeholder="Kata sandi"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setTampilkanSandi((v) => !v)}
              className="absolute inset-y-0 right-0 my-auto mr-2 flex h-7 w-7 items-center justify-center rounded-sm text-abu hover:text-tinta"
              aria-label={
                tampilkanSandi
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
              title={
                tampilkanSandi
                  ? "Sembunyikan kata sandi"
                  : "Tampilkan kata sandi"
              }
            >
              {tampilkanSandi ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                  <path d="M9.9 5.2A9.9 9.9 0 0112 5c6.2 0 9.5 7 9.5 7a16.9 16.9 0 01-3.6 4.5M6.8 6.8A16.6 16.6 0 002.5 12s3.3 7 9.5 7c1.5 0 2.8-.4 4-1" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </Field>
      </div>
      {galat ? (
        <p className="mt-3 text-xs font-semibold text-stempel">{galat}</p>
      ) : null}
      <button
        type="submit"
        className="tombol tombol-utama w-full justify-center py-3 mt-5"
        disabled={sibuk}
      >
        {sibuk ? "Memproses..." : "Masuk"}
      </button>
      <p className="mt-4 text-[11px] text-abu leading-relaxed">
        Gunakan Kode Satker sebagai nama pengguna. Pada login pertama, pakai
        kata sandi bawaan sesuai panduan, lalu ganti melalui menu Pengaturan di
        halaman editor.
      </p>
    </form>
  );
}
