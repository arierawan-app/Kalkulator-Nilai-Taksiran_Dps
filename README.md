# Kalkulator Nilai Taksiran BMN - Kendaraan Bermotor

Aplikasi kertas kerja analisis penentuan nilai taksiran BMN berupa kendaraan
bermotor dengan metode perbandingan data harga penjualan lelang, mengikuti
Tata Cara Penentuan Nilai Taksiran (dokumen referensi tersedia di folder ini:
`Tata_cara_taksiran.pdf` dan `Forrmat template output nilai taksiran.pdf`).

## Fitur

- Login Google (OAuth). Draf dan hasil PDF tersimpan pada folder
  `Kalkulator Nilai Taksiran` di Google Drive pengguna (scope `drive.file`);
  tidak ada data yang disimpan di server aplikasi.
- Penyimpanan otomatis (autosave) dengan indikator status, daftar dokumen
  tersimpan (buka/hapus), serta cadangan draf di perangkat.
- Form lengkap: identitas satker + logo, Panitia Penaksir, objek dan fisik
  kendaraan (termasuk cc untuk klasifikasi low/middle/high-end), data hasil
  lelang, penyesuaian manual dengan nilai ketentuan sebagai panduan, dan
  perhitungan penyesuaian merek (Fpm) sebagai Lembar Kedua.
- Validasi sesuai ketentuan: tahun lelang maksimal 3 tahun sebelum tahun
  penilaian (ditolak dengan popup), data pembanding 3-7, rentang tahun
  pembuatan +/-5 tahun, kategori lokasi 1-4, faktor kondisi per tujuan
  penjualan (termasuk pengecualian tanpa dokumen kepemilikan = 0,5).
- Panduan wilayah perluasan pencarian data per provinsi, termasuk urutan
  khusus Bali dan Nusa Tenggara (satu provinsi -> Denpasar/Surabaya/Sidoarjo
  -> seluruh Indonesia) dan pengecualian Kota Batam/Sabang.
- Output PDF dua lembar menyerupai format template resmi, pembulatan ke atas
  pada ribuan rupiah, dapat diunduh dan/atau disimpan ke Drive.

## Struktur

```
src/app                 halaman (landing, editor) dan API routes
src/components/editor   komponen form, panduan, rekap
src/components/cetak    template kertas kerja + util PDF
src/lib                 fungsi perhitungan, validasi, ketentuan, auth, Drive
src/data/kpknl.json     daftar KPKNL per provinsi (sumber publik DJKN)
tests                   unit test perhitungan & validasi (vitest)
legacy/index.html       prototipe lama (arsip)
```

## Prasyarat

- Node.js 20+ (disarankan 22)
- Akun Google dengan akses Google Cloud Console (gratis)

## 1. Menyiapkan Google OAuth (sekali saja)

1. Buka https://console.cloud.google.com dan buat project baru
   (mis. `kalkulator-nilai-taksiran`).
2. Menu **APIs & Services > Library**, cari **Google Drive API**, klik
   **Enable**.
3. Menu **APIs & Services > OAuth consent screen**:
   - Pilih **External**, isi nama aplikasi, email support, dan email developer.
   - Pada bagian **Audience**, tambahkan akun Google pengguna di **Test users**
     (mis. akun DJPb Anda). Selama status masih **Testing**, hanya akun uji
     yang dapat login. Scope `drive.file` termasuk non-sensitif sehingga tidak
     memerlukan verifikasi Google untuk produksi.
4. Menu **APIs & Services > Credentials > Create credentials > OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://<domain-vercel-anda>` (isi setelah deploy)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://<domain-vercel-anda>/api/auth/callback/google`
5. Simpan **Client ID** dan **Client Secret**.

## 2. Menjalankan lokal

```bash
npm install
cp .env.example .env.local
# isi AUTH_SECRET (openssl rand -base64 32), AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
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
   - `AUTH_GOOGLE_ID`
   - `AUTH_GOOGLE_SECRET`
3. Deploy, lalu salin domain `*.vercel.app` yang diperoleh dan tambahkan
   `https://<domain>/api/auth/callback/google` pada Authorized redirect URIs
   di Google Cloud Console (langkah 1.4). Deploy ulang bila perlu.
4. Buka domain Vercel, login dengan akun Google yang terdaftar sebagai test
   user, lalu mulai menyusun kertas kerja.

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
