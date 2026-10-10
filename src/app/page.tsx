import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function Beranda() {
  const session = await auth();
  if (session) redirect("/editor");

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.15fr_1fr]">
      <section className="px-8 py-12 lg:px-16 lg:py-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-garis">
        <div>
          <p className="text-sm font-semibold text-kuningan tracking-wide">
            Direktorat Jenderal Kekayaan Negara - Penilaian BMN
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-tinta-900 mt-4 leading-tight max-w-xl">
            Kertas kerja penentuan nilai taksiran kendaraan bermotor yang
            menghitung dirinya sendiri.
          </h1>
          <p className="mt-6 max-w-xl text-abu leading-relaxed">
            Susun tabulasi data harga penjualan lelang, isi penyesuaian merek,
            tipe, waktu, lokasi, dan tahun pembuatan mengikuti ketentuan,
            lalu hasilkan kertas kerja analisis dua lembar beserta taksiran
            nilai limit lelang - siap cetak dan tersimpan di Google Drive Anda.
          </p>
        </div>
        <dl className="mt-12 grid sm:grid-cols-3 gap-6 max-w-2xl">
          <div className="border-t border-garis pt-3">
            <dt className="text-xs font-semibold text-abu">Data pembanding</dt>
            <dd className="font-serif text-lg text-tinta mt-1">
              3 - 7 data lelang, maks. 3 tahun ke belakang
            </dd>
          </div>
          <div className="border-t border-garis pt-3">
            <dt className="text-xs font-semibold text-abu">
              Penyesuaian
            </dt>
            <dd className="font-serif text-lg text-tinta mt-1">
              Merek, tipe, waktu, lokasi, tahun pembuatan
            </dd>
          </div>
          <div className="border-t border-garis pt-3">
            <dt className="text-xs font-semibold text-abu">Hasil</dt>
            <dd className="font-serif text-lg text-tinta mt-1">
              Nilai limit lelang, pembulatan ke atas ribuan
            </dd>
          </div>
        </dl>
      </section>

      <section className="px-8 py-12 lg:px-16 lg:py-20 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="kolom-rekap p-8">
            <p className="text-sm text-abu">
              Masuk dengan akun Google untuk mulai menyusun kertas kerja.
            </p>
            <form
              className="mt-6"
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/editor" });
              }}
            >
              <button type="submit" className="tombol tombol-utama w-full justify-center py-3">
                Masuk dengan Google
              </button>
            </form>
            <ul className="mt-6 space-y-2 text-xs text-abu leading-relaxed list-disc pl-4">
              <li>
                Draf disimpan otomatis pada folder &quot;Kalkulator Nilai
                Taksiran&quot; di Google Drive Anda; tidak ada data yang
                disimpan di server aplikasi.
              </li>
              <li>
                PDF kertas kerja dapat diunduh dan/atau disimpan ke Drive.
              </li>
              <li>
                Akses aplikasi hanya ke file yang dibuatnya (scope drive.file).
              </li>
            </ul>
          </div>
          <p className="text-xs text-abu mt-4 leading-relaxed">
            Perhitungan mengikuti Tata Cara Penentuan Nilai Taksiran BMN:
            metode perbandingan data harga penjualan lelang, klasifikasi cc,
            faktor kondisi sesuai tujuan penjualan, dan perluasan wilayah
            pencarian data.
          </p>
        </div>
      </section>
    </main>
  );
}
