# Panduan Agen - Kalkulator Nilai Taksiran

## Alur kerja wajib

- **Selalu langsung `git commit` dan `git push origin main` setiap selesai perbaikan/fitur**, tanpa perlu diminta ulang.
- Pesan commit: bahasa Indonesia, ringkas, gaya repo (tanpa prefix conventional commit), fokus pada perubahan.
- Sebelum commit: jalankan `npm run typecheck` dan `npm run test`; pastikan lolos.
- Vercel men-deploy otomatis dari branch `main`.
- Jangan commit berkas `.env.local` atau rahasia.

## Perintah

- `npm run dev` - jalankan lokal (http://localhost:3000)
- `npm run typecheck` - pemeriksaan tipe
- `npm run test` - unit test (vitest)
- `npm run build` - build produksi
