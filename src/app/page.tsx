import { redirect } from "next/navigation";
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
          <SketsaKendaraan />
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

function SketsaKendaraan() {
  return (
    <svg
      className="block h-auto min-w-0 w-full max-w-full"
      viewBox="0 0 760 290"
      role="img"
      aria-labelledby="sketsa-kendaraan-title"
    >
      <title id="sketsa-kendaraan-title">
        Sketsa konsep sepeda motor dan mobil
      </title>
      <g
        fill="none"
        stroke="#143a5c"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Roda dan rangka sepeda motor */}
        <g opacity="0.62" strokeWidth="2.4">
          <circle cx="105" cy="211" r="34" />
          <circle cx="105" cy="211" r="8" />
          <circle cx="315" cy="211" r="34" />
          <circle cx="315" cy="211" r="8" />
          <path d="M105 211 145 163 207 159 237 201 151 201 185 151" />
          <path d="m207 159 65-3 43 55M237 201l-30-42" />
          <path d="M145 163q12-26 38-28l30 2q18 1 28 17l-7 14-28-8-32 1" />
          <path d="m201 151 16-21q15-12 37-7l21 8-13 21-39 7" />
          <path d="m282 169 21-32 13-5 10 4-10 7-7 17m-4-26 14-10 17 2" />
          <path d="M285 178q16 7 25 21l9 12m-134-52q-3 23 8 41" />
          <path d="M161 203h52q11 0 18 8l8 10h-67q-15-3-19-18" />
          <path d="M180 167q20-10 42 0v28h-43z" />
          <path d="M176 177h49m-43 8h40m-36 8h31" opacity="0.55" />
          <path d="M85 211h40m170 0h40M105 177v68m-34-34h68m176-34v68m-34-34h68" opacity="0.42" />
          <path d="M133 151q-14-19-1-36m-4 30q-9-18 4-31" stroke="#a9852f" />
        </g>

        {/* Garis bantu sketsa motor */}
        <g opacity="0.35" strokeWidth="1.2" strokeDasharray="5 6">
          <path d="M66 258h289m-250 8v-16m210 16v-16" />
          <path d="M89 91q95-24 210 1" />
        </g>

        {/* Roda dan bodi mobil */}
        <g opacity="0.62" strokeWidth="2.4">
          <path d="M410 207 420 180q4-11 22-16l39-10 31-34q9-10 25-11h65q17 1 29 16l28 34 38 10q15 4 23 18l7 20h-29" />
          <path d="M443 207a32 32 0 0 1 64 0m127 0a32 32 0 0 1 64 0" />
          <path d="M411 207h32m64 0h127m64 0h35" />
          <circle cx="475" cy="211" r="27" />
          <circle cx="666" cy="211" r="27" />
          <circle cx="475" cy="211" r="7" />
          <circle cx="666" cy="211" r="7" />
          <path d="m488 151 30-33q7-7 19-7h21v40zm80-40h23q14 1 22 12l25 28h-70z" />
          <path d="M538 111v40m56-39v39m-80 9h122m-175 15q15-11 30-11m160 0 33 9" opacity="0.55" />
          <path d="M412 204h-12m322 0h13m-276 18h34m130 0h35" stroke="#a9852f" />
        </g>

        {/* Garis bantu, sumbu, dan penanda ukuran */}
        <g opacity="0.35" strokeWidth="1.2" strokeDasharray="5 6">
          <path d="M393 258h354m-273 8v-16m191 16v-16" />
          <path d="M444 88q104-28 229 4" />
        </g>
        <g fill="#a9852f" stroke="none" opacity="0.78">
          <circle cx="105" cy="211" r="2.5" />
          <circle cx="315" cy="211" r="2.5" />
          <circle cx="475" cy="211" r="2.5" />
          <circle cx="666" cy="211" r="2.5" />
        </g>
      </g>
      <g
        fill="#6e6a5e"
        fontFamily="IBM Plex Sans, sans-serif"
        fontSize="11"
        letterSpacing="2"
        opacity="0.8"
      >
        <text x="177" y="282" textAnchor="middle">RODA DUA</text>
        <text x="570" y="282" textAnchor="middle">RODA EMPAT</text>
      </g>
    </svg>
  );
}
