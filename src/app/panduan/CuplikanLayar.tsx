import Image from "next/image";
import styles from "./page.module.css";

type JenisCuplikan = "masuk" | "data-awal" | "lelang" | "penyesuaian" | "rekap";

function BilahAplikasi() {
  return (
    <div className={styles.appBar}>
      <span className={styles.appName}>Kalkulator Nilai Taksiran BMN</span>
      <span className={styles.appActions}>
        <span>Buka dokumen</span>
        <span>Simpan</span>
      </span>
    </div>
  );
}

function KolomIsian({
  label,
  nilai,
  sorot = false,
}: {
  label: string;
  nilai: string;
  sorot?: boolean;
}) {
  return (
    <div className={styles.screenField}>
      <span>{label}</span>
      <div className={sorot ? styles.highlightField : undefined}>{nilai}</div>
    </div>
  );
}

function LayarMasuk() {
  return (
    <div className={styles.loginScreen}>
      <div className={styles.loginIntro}>
        <span className={styles.loginMark} aria-hidden="true">
          <Image src="/melasti.png" alt="" width={25} height={24} />
        </span>
        <p className={styles.loginOffice}>KPKNL Denpasar</p>
        <p className={styles.loginProduct}>
          Kalkulator Nilai Taksiran Kendaraan Bermotor
        </p>
        <p className={styles.loginDescription}>
          Alat bantu penyusunan kertas kerja penentuan nilai taksiran.
        </p>
      </div>
      <div className={styles.loginForm}>
        <p className={styles.loginNote}>
          Masuk dengan Kode Satker untuk mulai menyusun kertas kerja.
        </p>
        <KolomIsian label="Kode Satker (nama pengguna)" nilai="20 Digit Kode Satker" />
        <KolomIsian label="Kata Sandi" nilai="••••••••••" />
        <div className={styles.loginButton}>Masuk</div>
      </div>
    </div>
  );
}

function LayarDataAwal() {
  return (
    <>
      <BilahAplikasi />
      <div className={styles.formScreen}>
        <section className={styles.screenSection}>
          <h3><span>A.</span> Identitas Satuan Kerja</h3>
          <div className={styles.screenGrid}>
            <KolomIsian label="Nama Kementerian/Lembaga" nilai="KEMENTERIAN KEUANGAN" />
            <KolomIsian label="Nama Satuan Kerja" nilai="KPKNL Denpasar" />
            <KolomIsian label="Tujuan pemindahtanganan" nilai="Penjualan melalui lelang" />
          </div>
        </section>
        <section className={styles.screenSection}>
          <h3><span>B.</span> Panitia Penaksir dan Waktu Penentuan</h3>
          <div className={styles.screenGrid}>
            <KolomIsian label="Kota penentuan nilai taksiran" nilai="Denpasar" />
            <KolomIsian label="Tanggal penentuan nilai taksiran" nilai="12/10/2026" />
            <KolomIsian label="Tahun penilaian" nilai="2026" sorot />
            <KolomIsian label="Susunan panitia penaksir" nilai="Ketua dan anggota" />
          </div>
        </section>
        <section className={styles.screenSection}>
          <h3><span>C.</span> Identifikasi dan Fisik Objek</h3>
          <div className={styles.screenGrid}>
            <KolomIsian label="Nama objek" nilai="Honda Beat 110 cc" />
            <KolomIsian label="Lokasi objek" nilai="Denpasar" />
            <KolomIsian label="KPKNL rencana lelang" nilai="KPKNL Denpasar" />
            <KolomIsian label="Tahun pembuatan" nilai="2021" />
            <KolomIsian label="Kapasitas silinder (cc)" nilai="110" />
            <KolomIsian label="Kondisi / tingkat kerusakan" nilai="Sampai dengan 80%" />
            <KolomIsian label="Dokumen kepemilikan" nilai="BPKB" />
          </div>
        </section>
      </div>
    </>
  );
}

function LayarLelang() {
  return (
    <>
      <BilahAplikasi />
      <div className={styles.formScreen}>
        <section className={styles.screenSection}>
          <div className={styles.sectionHeadingRow}>
            <h3><span>D.</span> Data Hasil Lelang</h3>
            <span className={styles.dataCount}>3 data (min 3, maks 7)</span>
          </div>
          <div className={styles.searchNote}>
            Cari data hasil lelang melalui <strong>SIP DJKN</strong>.
          </div>
          <div className={styles.dataRow}>
            <div className={styles.dataRowHead}>
              <strong>Data 1</strong>
              <span>Hasil lelang pembanding</span>
            </div>
            <div className={styles.screenGrid}>
              <KolomIsian label="Lokasi lelang (KPKNL/kota)" nilai="KPKNL Denpasar" />
              <KolomIsian label="Kode lelang" nilai="ABC/2025" />
              <KolomIsian label="Merek" nilai="Honda" />
              <KolomIsian label="Tipe" nilai="Beat" />
              <KolomIsian label="Harga lelang (Rp)" nilai="8.750.000" sorot />
              <KolomIsian label="Tahun transaksi lelang" nilai="2025" />
              <KolomIsian label="Kategori lokasi lelang" nilai="Kategori 1" />
              <KolomIsian label="Tahun pembuatan" nilai="2021" />
            </div>
          </div>
          <div className={styles.addRow}>
            <span>Tambahkan data lain yang paling sesuai.</span>
            <span className={styles.addButton}>+ Tambah data</span>
          </div>
        </section>
      </div>
    </>
  );
}

function LayarPenyesuaian() {
  return (
    <>
      <BilahAplikasi />
      <div className={styles.formScreen}>
        <section className={styles.screenSection}>
          <div className={styles.sectionHeadingRow}>
            <h3><span>E.</span> Penyesuaian Data Pembanding</h3>
            <span className={styles.outlineButton}>Isi sesuai ketentuan</span>
          </div>
          <p className={styles.screenHint}>Nilai saran ditampilkan sebagai pembanding.</p>
          <div className={styles.adjustmentGrid}>
            <KolomIsian label="Tipe (%)" nilai="0" />
            <KolomIsian label="Merek (%)" nilai="0" />
            <KolomIsian label="Waktu (%)" nilai="2" sorot />
            <KolomIsian label="Lokasi (%)" nilai="0" />
            <KolomIsian label="Tahun pembuatan (%)" nilai="0" />
          </div>
          <div className={styles.totalLine}>
            <span>Total penyesuaian: <strong>2%</strong></span>
            <span>Nilai taksiran data: <strong>Terhitung otomatis</strong></span>
          </div>
        </section>
        <section className={`${styles.screenSection} ${styles.brandSection}`}>
          <h3><span>F.</span> Perhitungan Penyesuaian Merek <small>(Lembar Kedua)</small></h3>
          <p>Isi jika merek objek tidak ada pada data pembanding.</p>
        </section>
      </div>
    </>
  );
}

function LayarRekap() {
  return (
    <>
      <BilahAplikasi />
      <div className={styles.summaryScreen}>
        <div className={styles.summaryForm}>
          <div className={styles.summaryFormLine} />
          <div className={styles.summaryFormLine} />
          <div className={styles.summaryFormTitle}>Formulir kertas kerja</div>
          <div className={styles.summaryFormLine} />
          <div className={styles.summaryFormLine} />
          <div className={styles.summaryFormLineShort} />
        </div>
        <aside className={styles.summaryPanel}>
          <h3>Rekap Nilai Taksiran</h3>
          <p>3 data pembanding · faktor kondisi 0,7</p>
          <div className={styles.summaryLine}><span>Total nilai taksiran</span><strong>Rp 18.500.000</strong></div>
          <div className={styles.summaryLine}><span>Rata-rata nilai taksiran</span><strong>Rp 6.166.667</strong></div>
          <div className={styles.summaryLine}><span>Taksiran nilai limit</span><strong>Rp 4.316.667</strong></div>
          <div className={`${styles.summaryLine} ${styles.summaryResult}`}><span>Pembulatan ke atas ribuan</span><strong>Rp 4.317.000</strong></div>
          <div className={styles.previewButton}>Pratinjau kertas kerja</div>
          <div className={styles.printButton}>Cetak / Simpan PDF</div>
        </aside>
      </div>
    </>
  );
}

function IsiLayar({ jenis }: { jenis: JenisCuplikan }) {
  switch (jenis) {
    case "masuk":
      return <LayarMasuk />;
    case "data-awal":
      return <LayarDataAwal />;
    case "lelang":
      return <LayarLelang />;
    case "penyesuaian":
      return <LayarPenyesuaian />;
    case "rekap":
      return <LayarRekap />;
  }
}

export function CuplikanLayar({
  jenis,
  keterangan,
}: {
  jenis: JenisCuplikan;
  keterangan: string;
}) {
  return (
    <figure className={styles.screenFigure}>
      <div
        className={styles.browserWindow}
        role="img"
        aria-label={`Cuplikan layar aplikasi: ${keterangan}`}
      >
        <div className={styles.browserChrome} aria-hidden="true">
          <span className={styles.browserDots}><i /><i /><i /></span>
          <span className={styles.browserAddress}>kalkulator-nilai-taksiran / {jenis}</span>
          <span className={styles.browserMenu}>•••</span>
        </div>
        <IsiLayar jenis={jenis} />
      </div>
      <figcaption className={styles.screenCaption}>
        <span>{keterangan}</span>
        <span className={styles.captionMark}>Tampilan aplikasi</span>
      </figcaption>
    </figure>
  );
}
