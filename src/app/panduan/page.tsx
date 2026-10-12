import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CuplikanLayar } from "./CuplikanLayar";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Panduan Penggunaan | Kalkulator Nilai Taksiran",
  description:
    "Panduan singkat menggunakan Kalkulator Nilai Taksiran Kendaraan Bermotor, dari mengisi data hingga menyimpan kertas kerja PDF.",
};

const alur = [
  { bagian: "A–C", judul: "Data awal", keterangan: "Satker, panitia, dan kendaraan" },
  { bagian: "D", judul: "Pembanding", keterangan: "3–7 data hasil lelang" },
  { bagian: "E–F", judul: "Penyesuaian", keterangan: "Periksa nilai yang disarankan" },
  { bagian: "", judul: "Rekap dan PDF", keterangan: "Periksa, lalu simpan hasil" },
];

export default function HalamanPanduan() {
  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Kembali ke halaman aplikasi">
          <Image
            src="/melasti.png"
            alt=""
            width={56}
            height={54}
            className={styles.brandLogo}
            priority
          />
          <span>
            <strong>KPKNL Denpasar</strong>
            <small>Kalkulator Nilai Taksiran</small>
          </span>
        </Link>
        <Link href="/" className={styles.topAction}>
          Masuk ke aplikasi <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="judul-panduan">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span />Panduan penggunaan</p>
            <h1 id="judul-panduan">Dari data kendaraan sampai kertas kerja.</h1>
            <p className={styles.heroLead}>
              Ikuti urutan form dari atas ke bawah. Aplikasi membantu menghitung
              nilai dan menyiapkan kertas kerja untuk diperiksa.
            </p>
            <div className={styles.heroActions}>
              <Link href="/" className={styles.primaryAction}>
                Mulai menggunakan aplikasi
              </Link>
              <span>5 langkah sederhana</span>
            </div>
          </div>

          <aside className={styles.flowMap} aria-label="Ringkasan alur penggunaan">
            <div className={styles.flowHeading}>
              <span>Urutan kerja</span>
              <span className={styles.flowRule} />
            </div>
            <ol className={styles.flowList}>
              {alur.map((langkah, index) => (
                <li key={langkah.judul}>
                  <span className={styles.flowNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.flowText}>
                    <strong>{langkah.judul}</strong>
                    <small>
                      {langkah.bagian ? `${langkah.bagian} · ` : ""}
                      {langkah.keterangan}
                    </small>
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.flowFoot}>Isi sesuai urutan bagian pada layar.</p>
          </aside>
        </section>

        <section className={styles.guide} aria-labelledby="judul-langkah">
          <div className={styles.guideHeading}>
            <span className={styles.headingNumber}>01—05</span>
            <div>
              <h2 id="judul-langkah">Langkah penggunaan</h2>
              <p>Setiap cuplikan menunjukkan bagian yang perlu Anda cari.</p>
            </div>
          </div>

          <ol className={styles.steps}>
            <li className={styles.step}>
              <div className={styles.stepCopy}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>01</span>
                  <span className={styles.stepType}>Akses</span>
                </div>
                <h3>Masuk dengan Kode Satker</h3>
                <p>
                  Masukkan Kode Satker sebagai nama pengguna dan kata sandi.
                  Nama kementerian/lembaga serta satuan kerja akan terisi
                  otomatis. Pada login pertama, ganti kata sandi melalui menu
                  Pengaturan.
                </p>
              </div>
              <CuplikanLayar jenis="masuk" keterangan="Halaman masuk" />
            </li>

            <li className={`${styles.step} ${styles.stepAlternate}`}>
              <div className={styles.stepCopy}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>02</span>
                  <span className={styles.stepType}>Bagian A–C</span>
                </div>
                <h3>Lengkapi data awal</h3>
                <ul className={styles.instructionList}>
                  <li><b>A</b><span>Periksa identitas satker dan pilih tujuan penjualan.</span></li>
                  <li><b>B</b><span>Isi kota, tanggal, tahun penilaian, dan susunan panitia.</span></li>
                  <li><b>C</b><span>Isi identitas kendaraan, lokasi, kondisi, dan dokumennya.</span></li>
                </ul>
                <p className={styles.smallNote}>
                  Logo satker diunggah lewat <strong>Pengaturan</strong>.
                </p>
              </div>
              <CuplikanLayar jenis="data-awal" keterangan="Bagian A, B, dan C pada formulir" />
            </li>

            <li className={styles.step}>
              <div className={styles.stepCopy}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>03</span>
                  <span className={styles.stepType}>Bagian D</span>
                </div>
                <h3>Masukkan data lelang pembanding</h3>
                <p>
                  Cari hasil lelang melalui tautan{" "}
                  <a
                    href="https://sipdjkn.kemenkeu.go.id/sip-permohonan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.inlineLink}
                  >
                    SIP DJKN
                  </a>
                  . Klik <strong>Tambah data</strong>, lalu isi lokasi, kode lelang,
                  merek dan tipe, harga, kategori lokasi, tahun transaksi, serta
                  tahun pembuatan.
                </p>
                <div className={styles.callout}>
                  Gunakan minimal <strong>3</strong> dan maksimal <strong>7</strong> data
                  pembanding yang paling sesuai.
                </div>
              </div>
              <CuplikanLayar jenis="lelang" keterangan="Bagian D: data hasil lelang" />
            </li>

            <li className={`${styles.step} ${styles.stepAlternate}`}>
              <div className={styles.stepCopy}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>04</span>
                  <span className={styles.stepType}>Bagian E–F</span>
                </div>
                <h3>Periksa penyesuaian</h3>
                <p>
                  Nilai saran muncul otomatis. Klik <strong>Isi sesuai ketentuan</strong>{" "}
                  untuk memakainya. Jika mengubah nilai saran, centang konfirmasi
                  pertimbangan Panitia Penaksir sebelum mencetak.
                </p>
                <p className={styles.smallNote}>
                  Bagian F (Lembar Kedua) diisi bila merek kendaraan objek tidak
                  tersedia pada data pembanding.
                </p>
              </div>
              <CuplikanLayar jenis="penyesuaian" keterangan="Bagian E dan F: penyesuaian data" />
            </li>

            <li className={styles.step}>
              <div className={styles.stepCopy}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>05</span>
                  <span className={styles.stepType}>Rekap dan berkas</span>
                </div>
                <h3>Periksa rekap, lalu simpan</h3>
                <p>
                  Perbaiki semua temuan berwarna merah. Setelah tidak ada
                  kesalahan, buka pratinjau, klik <strong>Cetak / Simpan PDF</strong>,
                  atau pilih <strong>Unduh Word (.docx)</strong>. Word berisi tabel
                  yang dapat diedit dan mengikuti susunan kertas kerja.
                </p>
                <p className={styles.smallNote}>
                  Untuk PDF, pilih <strong>Simpan sebagai PDF</strong>, ukuran A4,
                  dan skala 100% pada dialog cetak.
                </p>
                <p className={styles.smallNote}>
                  Draf tersimpan otomatis di browser ini. Klik <strong>Simpan</strong>{" "}
                  untuk membuat berkas data (.json), lalu gunakan <strong>Buka dokumen</strong>{" "}
                  untuk membukanya kembali.
                </p>
              </div>
              <CuplikanLayar jenis="rekap" keterangan="Rekap nilai dan tombol cetak" />
            </li>
          </ol>
        </section>

        <section className={styles.closing} aria-label="Mulai menggunakan aplikasi">
          <div>
            <p className={styles.closingEyebrow}>Siap mulai?</p>
            <h2>Isi form dari bagian A sampai rekap.</h2>
          </div>
          <Link href="/" className={styles.closingAction}>
            Masuk ke aplikasi <span aria-hidden="true">↗</span>
          </Link>
        </section>

        <p className={styles.footerNote}>
          Nilai taksiran berlaku 6 bulan sejak tanggal penentuan. Pastikan kertas
          kerja diperiksa dan ditandatangani Panitia Penaksir.
        </p>
      </main>
    </div>
  );
}
