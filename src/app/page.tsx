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
            KPKNL Denpasar
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-tinta-900 mt-4 leading-tight max-w-xl">
            Kalkulator Nilai Taksiran Kendaraan Bermotor
          </h1>
          <p className="mt-6 max-w-xl text-abu leading-relaxed">
            Alat bantu penyusunan kertas kerja penentuan nilai taksiran
            berdasarkan KMK Nomor 375 Tahun 2024.
          </p>
        </div>
        <p className="mt-12 max-w-xl border-t border-garis pt-3 text-sm text-abu leading-relaxed">
          Data akan tersimpan pada Google Drive Anda, maka autentikasi akses
          email dan Google Drive diperlukan.
        </p>
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
