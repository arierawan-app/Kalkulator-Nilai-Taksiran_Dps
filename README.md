# Kalkulator Nilai Taksiran BMN - Kendaraan Bermotor

Aplikasi kertas kerja analisis penentuan nilai taksiran BMN berupa kendaraan
bermotor dengan metode perbandingan data harga penjualan lelang, mengikuti
Tata Cara Penentuan Nilai Taksiran (dokumen referensi tersedia di folder ini:
`Tata_cara_taksiran.pdf` dan `Forrmat template output nilai taksiran.pdf`).

## Fitur

- Login dengan Kode Satker (nama pengguna) dan kata sandi melalui Supabase.
  Kata sandi bawaan saat login pertama adalah `KNL.1401` dan dapat diganti
  kapan saja melalui menu **Pengaturan** bersama unggah logo
  kementerian/lembaga. Nama kementerian/lembaga dan nama satuan kerja terisi
  otomatis dari data master satker saat masuk. Seluruh data kertas kerja
  disimpan di perangkat pengguna sendiri (local storage browser + berkas
  pilihan pengguna); tidak ada data kertas kerja yang disimpan di server
  aplikasi.
- Data isian disimpan sebagai berkas `.json` ke perangkat dengan pop-up
  pemilihan lokasi (File System Access API pada Chrome/Edge); pada browser
  yang belum mendukungnya berkas otomatis diunduh. PDF dicetak dari tampilan
  kertas kerja yang sama melalui dialog cetak browser; pilih **Simpan sebagai
  PDF** untuk menyimpannya di perangkat.
- Draf tersimpan otomatis di perangkat dengan indikator status. Data isian
  dapat dibuka kembali dari berkas `.json`, dan PDF hasil penilaian dapat
  dibuka melalui penampil PDF di dalam aplikasi.
- Form lengkap: identitas satker (logo diunggah melalui Pengaturan
  Pengguna), Panitia Penaksir, objek dan fisik
  kendaraan (termasuk cc untuk klasifikasi low/middle/high-end), data hasil
  lelang, penyesuaian manual dengan nilai ketentuan sebagai panduan, dan
  perhitungan penyesuaian merek (Fpm) sebagai Lembar Kedua.
- Validasi sesuai ketentuan: tahun lelang maksimal 3 tahun sebelum tahun
  penilaian (ditolak dengan popup), data pembanding 3-7, rentang tahun
  pembuatan +/-5 tahun, kategori lokasi 1-4, faktor kondisi per tujuan
  penjualan (termasuk pengecualian tanpa dokumen kepemilikan = 0,5).
- Panduan wilayah perluasan pencarian data per provinsi, termasuk urutan
  khusus Bali dan Nusa Tenggara (satu provinsi -> Surabaya/Sidoarjo
  -> seluruh Indonesia) dan pengecualian Kota Batam/Sabang.
- Output PDF dua lembar menyerupai format template resmi, pembulatan ke atas
  pada ribuan rupiah, dapat disimpan ke perangkat dan dibuka kembali melalui
  penampil PDF.

## Struktur

```
src/app                  halaman (landing + login, editor) dan API route
                         autentikasi
src/components/editor    komponen form, pengaturan pengguna, panduan, rekap
src/components/cetak     template kertas kerja + util PDF
src/lib                  fungsi perhitungan, validasi, ketentuan, auth
                         (Supabase), akun/profil, penyimpanan lokal
src/data/kpknl.json      daftar KPKNL per provinsi (sumber publik DJKN)
src/types                augmentasi tipe sesi next-auth
tests                    unit test perhitungan, validasi & akun (vitest)
legacy/index.html        prototipe lama (arsip)
```

## Prasyarat

- Node.js 20+ (disarankan 22)
- Proyek Supabase (gratis) untuk akun satker: tabel `knt_satker`
  (data master dari spreadsheet Kode Satker: kolom B, C, E), `knt_users`
  (hash kata sandi + logo), dan fungsi `knt_login`, `knt_profil`,
  `knt_ganti_sandi`, `knt_simpan_logo`. Semua sudah dibuat pada proyek
  Supabase `cockpit-bmn`; aplikasi hanya butuh URL dan publishable/anon key.

## 1. Menyiapkan Supabase (sekali saja)

Skema dan data akun sudah tersedia pada proyek `cockpit-bmn`:

1. `knt_satker` berisi 975 Kode Satker beserta Nama UAKPB dan K/L dari
   spreadsheet Kode Satker.
2. `knt_users` berisi satu akun per Kode Satker dengan kata sandi bawaan
   `KNL.1401` (hash bcrypt pgcrypto) dan `must_change_password = true`.
3. Row Level Security aktif tanpa policy; seluruh akses hanya melalui fungsi
   SECURITY DEFINER (`knt_login`, `knt_profil`, `knt_ganti_sandi`,
   `knt_simpan_logo`).

Ambil **Project URL** dan **publishable/anon key** dari dashboard Supabase
(Project Settings > API) untuk dipakai sebagai `SUPABASE_URL` dan
`SUPABASE_ANON_KEY`.

## 2. Menjalankan lokal

```bash
npm install
cp .env.example .env.local
# isi AUTH_SECRET (openssl rand -base64 32), SUPABASE_URL, SUPABASE_ANON_KEY
npm run dev
# buka http://localhost:3000
```

Perintah lain:

```bash
npm run test       # unit test perhitungan & validasi
npm run typecheck  # pemeriksaan tipe
npm run build      # build produksi
```

## 3. Deploy ke Vercel (gratis)

1. Import repository GitHub ini pada https://vercel.com/new (framework
   terdeteksi otomatis sebagai Next.js; tidak perlu mengubah build settings).
2. Tambahkan Environment Variables pada project:
   - `AUTH_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Deploy, lalu buka domain Vercel.
4. Login dengan Kode Satker (kata sandi bawaan `KNL.1401`), ganti kata sandi
   melalui menu **Pengaturan**, unggah logo kementerian/lembaga, lalu mulai
   menyusun kertas kerja.

## Pemecahan masalah umum

- **"Kode Satker atau kata sandi salah"**: pastikan Kode Satker persis seperti
  pada data master (tanpa spasi; huruf besar/kecil tidak berpengaruh) dan kata
  sandi benar. Pada login pertama gunakan kata sandi bawaan `KNL.1401`.
  Bila lupa kata sandi, minta administrator mengatur ulang: perbarui
  `password_hash` pada tabel `knt_users` (Supabase) memakai `crypt` pgcrypto
  dengan kata sandi bawaan dan set `must_change_password = true`.
- **Logo tidak muncul pada kertas kerja**: unggah logo melalui menu
  **Pengaturan** (bukan dari form editor), format PNG/JPEG maksimal 2 MB,
  lalu tekan **Simpan logo** (tanpa perlu kata sandi).
- **Data isian tidak tersimpan ke berkas**: tekan **Simpan** dan pilih lokasi
  pada pop-up (atau cek folder unduhan pada browser yang tidak mendukung
  pemilihan lokasi). Draf tetap tersimpan otomatis di browser perangkat
  tersebut, namun tidak berpindah ke perangkat/browser lain.
- **Menyimpan PDF**: tekan **Cetak / Simpan PDF**, lalu di dialog cetak browser
  pilih **Simpan sebagai PDF**, ukuran kertas A4, skala 100%, dan matikan
  header/footer browser bila tersedia. Tampilan PDF menggunakan layout kertas
  kerja yang sama dengan pratinjau aplikasi.

## Catatan kepatuhan

- Perhitungan mengikuti dokumen Tata Cara: penyesuaian waktu 2%/tahun,
  tahun pembuatan 5%/7%/10% per tahun sesuai kelas cc, tipe 8% per tingkat
  kelas, merek Fpm = (NJT-NJP)/NJP, lokasi 5% per perbedaan kategori, faktor
  kondisi 0,5/0,6/0,7 (lelang) atau 0,8/0,9/1,0 (tanpa lelang), tanpa dokumen
  kepemilikan 0,5.
- Nilai akhir dibulatkan ke atas pada ribuan dan berlaku 6 bulan sejak
  tanggal penentuan.
- Persentase penyesuaian pada aplikasi ini bersifat manual: aplikasi
  menampilkan nilai ketentuan sebagai pembanding dan meminta konfirmasi
  Panitia Penaksir bila nilai yang diisi berbeda. Keputusan akhir tetap pada
  Panitia Penaksir.
- Daftar KPKNL pada `src/data/kpknl.json` disusun dari informasi publik DJKN
  (71 KPKNL, 17 kanwil) untuk keperluan panduan pemilihan lokasi.
