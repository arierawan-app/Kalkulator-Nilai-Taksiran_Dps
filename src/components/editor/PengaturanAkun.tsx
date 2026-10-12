"use client";

import { useEffect, useState } from "react";
import { Field, Modal } from "./fields";
import { gantiSandi, simpanLogoProfil, type HasilAksi } from "@/lib/akun";
import { validasiLogo, validasiSandiBaru } from "@/lib/satker";
import type { ProfilSatker } from "@/lib/types";

function PesanStatus({ status }: { status: HasilAksi | null }) {
  if (!status) return null;
  return (
    <p
      className={`mt-2 text-xs font-semibold ${
        status.ok ? "text-tinta-700" : "text-stempel"
      }`}
    >
      {status.pesan}
    </p>
  );
}

export function PengaturanAkun({
  buka,
  tutup,
  profil,
  onLogoBerubah,
  onSandiBerubah,
}: {
  buka: boolean;
  tutup: () => void;
  profil: ProfilSatker;
  onLogoBerubah: (logoDataUrl: string) => void;
  onSandiBerubah: () => void;
}) {
  const [logoSandi, setLogoSandi] = useState("");
  const [logoBaru, setLogoBaru] = useState("");
  const [logoNama, setLogoNama] = useState("");
  const [statusLogo, setStatusLogo] = useState<HasilAksi | null>(null);
  const [sibukLogo, setSibukLogo] = useState(false);

  const [sandiLama, setSandiLama] = useState("");
  const [sandiBaru, setSandiBaru] = useState("");
  const [sandiUlang, setSandiUlang] = useState("");
  const [statusSandi, setStatusSandi] = useState<HasilAksi | null>(null);
  const [sibukSandi, setSibukSandi] = useState(false);

  useEffect(() => {
    if (!buka) return;
    setLogoSandi("");
    setLogoBaru("");
    setLogoNama("");
    setStatusLogo(null);
    setSandiLama("");
    setSandiBaru("");
    setSandiUlang("");
    setStatusSandi(null);
  }, [buka]);

  const pilihLogo = (file: File | undefined) => {
    if (!file) return;
    const galat = validasiLogo(file);
    if (galat) {
      alert(galat);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBaru(String(reader.result));
      setLogoNama(file.name);
      setStatusLogo(null);
    };
    reader.readAsDataURL(file);
  };

  const kirimLogo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!logoBaru) {
      setStatusLogo({ ok: false, pesan: "Pilih file logo terlebih dahulu." });
      return;
    }
    setSibukLogo(true);
    const hasil = await simpanLogoProfil({
      sandi: logoSandi,
      logoDataUrl: logoBaru,
    });
    setSibukLogo(false);
    setStatusLogo(hasil);
    if (hasil.ok) {
      onLogoBerubah(logoBaru);
      setLogoBaru("");
      setLogoNama("");
      setLogoSandi("");
    }
  };

  const kirimSandi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const galat = validasiSandiBaru(sandiBaru);
    if (galat) {
      setStatusSandi({ ok: false, pesan: galat });
      return;
    }
    if (sandiBaru !== sandiUlang) {
      setStatusSandi({ ok: false, pesan: "Ulangi kata sandi baru dengan sama." });
      return;
    }
    setSibukSandi(true);
    const hasil = await gantiSandi({ sandiLama, sandiBaru });
    setSibukSandi(false);
    setStatusSandi(hasil);
    if (hasil.ok) {
      onSandiBerubah();
      setSandiLama("");
      setSandiBaru("");
      setSandiUlang("");
    }
  };

  const pratinjauLogo = logoBaru || profil.logoDataUrl;

  return (
    <Modal buka={buka} tutup={tutup} judul="Pengaturan Pengguna" lebar="max-w-2xl">
      <div className="space-y-6">
        <section>
          <h4 className="label">Identitas Satker</h4>
          <dl className="grid gap-1.5">
            <div className="flex flex-wrap gap-x-2">
              <dt className="w-48 shrink-0 text-abu">Kode Satker</dt>
              <dd className="angka font-semibold">{profil.kodeSatker}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="w-48 shrink-0 text-abu">
                Nama Kementerian/Lembaga
              </dt>
              <dd>{profil.namaKementerian}</dd>
            </div>
            <div className="flex flex-wrap gap-x-2">
              <dt className="w-48 shrink-0 text-abu">Nama Satuan Kerja</dt>
              <dd>{profil.namaSatker}</dd>
            </div>
          </dl>
        </section>

        <section className="border-t border-garis-2 pt-4">
          <h4 className="font-serif font-bold text-tinta-900">
            Logo Kementerian/Lembaga
          </h4>
          <p className="mt-1 text-xs text-abu leading-relaxed">
            Logo tampil pada kop kertas kerja PDF. Format PNG/JPEG, maksimal 2
            MB.
          </p>
          <form className="mt-3 grid gap-4 sm:grid-cols-[112px_1fr]" onSubmit={kirimLogo}>
            <div className="h-28 w-28 border border-dashed border-garis bg-white flex items-center justify-center overflow-hidden">
              {pratinjauLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pratinjauLogo}
                  alt="Pratinjau logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <span className="px-2 text-center text-[10px] text-abu">
                  Belum ada logo
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="tombol tombol-garis text-xs px-2.5 py-1.5 cursor-pointer">
                  Pilih file
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => pilihLogo(e.target.files?.[0])}
                  />
                </label>
                {logoNama ? (
                  <span className="text-xs text-abu">{logoNama}</span>
                ) : null}
              </div>
              <Field label="Kata sandi saat ini">
                <input
                  type="password"
                  className="field"
                  value={logoSandi}
                  onChange={(e) => setLogoSandi(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </Field>
              <button
                type="submit"
                className="tombol tombol-utama text-xs"
                disabled={sibukLogo}
              >
                {sibukLogo ? "Menyimpan..." : "Simpan logo"}
              </button>
              <PesanStatus status={statusLogo} />
            </div>
          </form>
        </section>

        <section className="border-t border-garis-2 pt-4">
          <h4 className="font-serif font-bold text-tinta-900">
            Ganti Kata Sandi
          </h4>
          <p className="mt-1 text-xs text-abu leading-relaxed">
            Minimal 8 karakter serta memuat huruf dan angka.
          </p>
          <form className="mt-3 grid gap-3 sm:grid-cols-3" onSubmit={kirimSandi}>
            <Field label="Kata sandi lama">
              <input
                type="password"
                className="field"
                value={sandiLama}
                onChange={(e) => setSandiLama(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            <Field label="Kata sandi baru">
              <input
                type="password"
                className="field"
                value={sandiBaru}
                onChange={(e) => setSandiBaru(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            <Field label="Ulangi kata sandi baru">
              <input
                type="password"
                className="field"
                value={sandiUlang}
                onChange={(e) => setSandiUlang(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="tombol tombol-utama text-xs"
                disabled={sibukSandi}
              >
                {sibukSandi ? "Menyimpan..." : "Simpan kata sandi"}
              </button>
              <PesanStatus status={statusSandi} />
            </div>
          </form>
        </section>
      </div>
    </Modal>
  );
}
