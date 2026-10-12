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
            placeholder="Contoh: 004012200579001000KD"
            autoComplete="username"
            autoCapitalize="characters"
            spellCheck={false}
            required
          />
        </Field>
        <Field label="Kata Sandi">
          <input
            type="password"
            className="field"
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
            placeholder="Kata sandi"
            autoComplete="current-password"
            required
          />
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
