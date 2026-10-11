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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
