import { redirect } from "next/navigation";
import Image from "next/image";
import { auth, signIn } from "@/lib/auth";

export default async function Beranda() {
  const session = await auth();
  if (session) redirect("/editor");

  return (
    <main className="min-h-screen grid grid-cols-1 min-w-0 lg:grid-cols-[1.15fr_1fr]">
      <section className="min-w-0 px-8 py-12 lg:px-16 lg:py-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-garis">
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
        <div className="mt-10 w-full min-w-0 max-w-3xl self-center lg:mt-0">
          <Image
            src="/background_vector.png"
            alt="Sketsa teknis mobil dan komponen kendaraan"
            width={1800}
            height={1355}
            sizes="(max-width: 768px) calc(100vw - 4rem), 768px"
            loading="eager"
            className="mx-auto block h-auto w-full max-w-full opacity-[0.62]"
          />
        </div>
      </section>

      <section className="min-w-0 px-8 py-12 lg:px-16 lg:py-20 flex items-center">
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
          </div>
        </div>
      </section>
    </main>
  );
}
