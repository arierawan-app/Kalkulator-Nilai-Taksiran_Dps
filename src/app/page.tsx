import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function Beranda() {
  const session = await auth();
  if (session) redirect("/editor");

  return (
    <main className="relative isolate min-h-screen grid grid-cols-1 min-w-0 overflow-hidden lg:grid-cols-[1.15fr_1fr]">
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
        aria-hidden="true"
      >
        <Image
          src="/background_vector.png"
          alt=""
          fill
          sizes="100vw"
          loading="eager"
          className="object-contain opacity-[0.22]"
        />
      </div>
      <section className="relative z-10 min-w-0 px-8 py-12 lg:px-16 lg:py-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-garis">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/melasti.png"
              alt="Logo Melasti KPKNL Denpasar"
              width={112}
              height={108}
              priority
              className="h-12 w-auto shrink-0 lg:h-14"
            />
            <p className="font-serif text-2xl font-bold tracking-wide text-kuningan lg:text-3xl">
              KPKNL Denpasar
            </p>
          </div>
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
            className="mx-auto block h-auto w-full max-w-full opacity-[0.62] lg:hidden"
          />
        </div>
      </section>

      <section className="relative z-10 min-w-0 px-8 py-12 lg:px-16 lg:py-20 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <div className="kolom-rekap p-8">
            <p className="text-sm text-abu">
              Masuk dengan Kode Satker untuk mulai menyusun kertas kerja. Nama
              kementerian/lembaga dan satuan kerja terisi otomatis dari data
              satker.
            </p>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
