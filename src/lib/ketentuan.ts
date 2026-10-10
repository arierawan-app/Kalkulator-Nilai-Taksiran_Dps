export type WilayahKey =
  | "jawa"
  | "sumatera"
  | "kalimantan_barat"
  | "kalimantan_utara_timur_tengah_selatan"
  | "sulawesi_maluku_papua"
  | "bali_nusa_tenggara";

export type KelasKendaraan = "low-end" | "middle" | "high-end";
export type JenisKendaraan = "roda23" | "roda4plus";
export type TujuanPenjualan = "lelang" | "tanpa_lelang";
export type TingkatKerusakan = "di_atas_90" | "80_sampai_90" | "sampai_80";

export const KOTA_TANPA_PERLUASAN = ["Batam", "Sabang"];

export const WILAYAH: Record<
  WilayahKey,
  { label: string; urutan: string[] }
> = {
  jawa: {
    label: "Jawa",
    urutan: [
      "Pertama: pada wilayah kerja KPKNL yang berbatasan langsung",
      "Kedua: pada wilayah kerja KPKNL di seluruh Jawa",
      "Ketiga: pada semua wilayah kerja KPKNL di Indonesia",
    ],
  },
  sumatera: {
    label: "Sumatera",
    urutan: [
      "Pertama: pada wilayah kerja KPKNL yang berbatasan langsung",
      "Kedua: pada wilayah kerja KPKNL seluruh Sumatera dan KPKNL di Jakarta, Bogor, Tangerang, dan Bekasi",
      "Ketiga: pada semua wilayah kerja KPKNL di Indonesia",
    ],
  },
  kalimantan_barat: {
    label: "Kalimantan Barat",
    urutan: [
      "Pertama: pada wilayah kerja KPKNL yang berada di Provinsi Kalimantan Barat",
      "Kedua: pada wilayah kerja KPKNL di Jakarta, Bogor, Tangerang, dan Bekasi",
      "Ketiga: pada semua wilayah kerja KPKNL di Indonesia",
    ],
  },
  kalimantan_utara_timur_tengah_selatan: {
    label: "Kalimantan Utara, Kalimantan Timur, Kalimantan Tengah dan Kalimantan Selatan",
    urutan: [
      "Pertama: pada wilayah kerja KPKNL yang berada di Provinsi Kalimantan Utara, Kalimantan Timur, Kalimantan Tengah dan Kalimantan Selatan",
      "Kedua: pada wilayah kerja KPKNL Surabaya, dan Sidoarjo",
      "Ketiga: pada semua wilayah kerja KPKNL di Indonesia",
    ],
  },
  sulawesi_maluku_papua: {
    label: "Sulawesi, Kepulauan Maluku dan Papua",
    urutan: [
      "Pertama: pada wilayah kerja KPKNL yang berada di satu provinsi",
      "Kedua: pada wilayah kerja KPKNL Makassar, Surabaya, dan Sidoarjo",
      "Ketiga: pada semua wilayah kerja KPKNL di Indonesia",
    ],
  },
  bali_nusa_tenggara: {
    label: "Bali dan Nusa Tenggara",
    urutan: [
      "Pertama: pada wilayah kerja KPKNL yang berada di satu provinsi",
      "Kedua: pada wilayah kerja KPKNL Denpasar, Surabaya, dan Sidoarjo",
      "Ketiga: pada semua wilayah kerja KPKNL di Indonesia",
    ],
  },
};

export const PROVINSI_WILAYAH: Record<string, WilayahKey> = {
  Aceh: "sumatera",
  "Sumatera Utara": "sumatera",
  "Sumatera Barat": "sumatera",
  Riau: "sumatera",
  "Kepulauan Riau": "sumatera",
  Jambi: "sumatera",
  Bengkulu: "sumatera",
  "Sumatera Selatan": "sumatera",
  "Kepulauan Bangka Belitung": "sumatera",
  Lampung: "sumatera",
  Banten: "jawa",
  "DKI Jakarta": "jawa",
  "Jawa Barat": "jawa",
  "Jawa Tengah": "jawa",
  "DI Yogyakarta": "jawa",
  "Jawa Timur": "jawa",
  "Kalimantan Barat": "kalimantan_barat",
  "Kalimantan Utara": "kalimantan_utara_timur_tengah_selatan",
  "Kalimantan Timur": "kalimantan_utara_timur_tengah_selatan",
  "Kalimantan Tengah": "kalimantan_utara_timur_tengah_selatan",
  "Kalimantan Selatan": "kalimantan_utara_timur_tengah_selatan",
  "Sulawesi Utara": "sulawesi_maluku_papua",
  Gorontalo: "sulawesi_maluku_papua",
  "Sulawesi Tengah": "sulawesi_maluku_papua",
  "Sulawesi Barat": "sulawesi_maluku_papua",
  "Sulawesi Selatan": "sulawesi_maluku_papua",
  "Sulawesi Tenggara": "sulawesi_maluku_papua",
  Maluku: "sulawesi_maluku_papua",
  "Maluku Utara": "sulawesi_maluku_papua",
  Papua: "sulawesi_maluku_papua",
  "Papua Barat": "sulawesi_maluku_papua",
  "Papua Selatan": "sulawesi_maluku_papua",
  "Papua Tengah": "sulawesi_maluku_papua",
  "Papua Pegunungan": "sulawesi_maluku_papua",
  "Papua Barat Daya": "sulawesi_maluku_papua",
  Bali: "bali_nusa_tenggara",
  "Nusa Tenggara Barat": "bali_nusa_tenggara",
  "Nusa Tenggara Timur": "bali_nusa_tenggara",
};

export const TARIF_TAHUN_PEMBUATAN: Record<KelasKendaraan, number> = {
  "low-end": 5,
  middle: 7,
  "high-end": 10,
};

export const PENYESUAIAN = {
  waktuPerTahun: 2,
  tipePerTingkat: 8,
  lokasiPerKategori: 5,
} as const;

export const BATAS = {
  minData: 3,
  maxData: 7,
  maksTahunLelangKebelakang: 3,
  rentangTahunPembuatan: 5,
} as const;

export const FAKTOR_KONDISI: Record<
  TujuanPenjualan,
  Record<TingkatKerusakan, number>
> = {
  lelang: {
    di_atas_90: 0.5,
    "80_sampai_90": 0.6,
    sampai_80: 0.7,
  },
  tanpa_lelang: {
    di_atas_90: 0.8,
    "80_sampai_90": 0.9,
    sampai_80: 1.0,
  },
};

export const FAKTOR_TANPA_DOKUMEN = 0.5;

export const LABEL_TINGKAT: Record<TingkatKerusakan, string> = {
  di_atas_90: "0,5 (Tingkat Kerusakan di atas 90%)",
  "80_sampai_90": "0,6 (Tingkat Kerusakan di atas 80%- 90%)",
  sampai_80: "0,7 (Tingkat Kerusakan sampai dengan 80%)",
};

export const LABEL_TINGKAT_TANPA_LELANG: Record<TingkatKerusakan, string> = {
  di_atas_90: "0,8 (Tingkat Kerusakan di atas 90%)",
  "80_sampai_90": "0,9 (Tingkat Kerusakan di atas 80%- 90%)",
  sampai_80: "1,0 (Tingkat Kerusakan sampai dengan 80%)",
};

export type TahapanPencarian = {
  tahap: number;
  wilayah: string;
  merek: string;
  tipe: string;
  tahun: string;
};

export const TAHAPAN_PENCARIAN: TahapanPencarian[] = [
  { tahap: 1, wilayah: "Wilayah kerja KPKNL pelaksana lelang", merek: "Sama", tipe: "Sama", tahun: "Sama" },
  { tahap: 2, wilayah: "Perluasan wilayah urutan pertama", merek: "Sama", tipe: "Sama", tahun: "Sama" },
  { tahap: 3, wilayah: "Wilayah kerja KPKNL pelaksana lelang", merek: "Sama", tipe: "Berbeda", tahun: "5 th lebih muda s.d. 5 th lebih tua" },
  { tahap: 4, wilayah: "Perluasan wilayah urutan pertama", merek: "Sama", tipe: "Berbeda", tahun: "5 th lebih muda s.d. 5 th lebih tua" },
  { tahap: 5, wilayah: "Perluasan wilayah urutan kedua", merek: "Sama", tipe: "Sama", tahun: "Sama" },
  { tahap: 6, wilayah: "Perluasan wilayah urutan kedua", merek: "Sama", tipe: "Berbeda", tahun: "5 th lebih muda s.d. 5 th lebih tua" },
  { tahap: 7, wilayah: "Perluasan wilayah urutan ketiga", merek: "Sama", tipe: "Sama", tahun: "Sama" },
  { tahap: 8, wilayah: "Perluasan wilayah urutan ketiga", merek: "Sama", tipe: "Berbeda", tahun: "5 th lebih muda s.d. 5 th lebih tua" },
  { tahap: 9, wilayah: "Wilayah kerja KPKNL pelaksana lelang", merek: "Berbeda", tipe: "Spesifikasi sama atau mendekati", tahun: "5 th lebih muda s.d. 5 th lebih tua" },
  { tahap: 10, wilayah: "Perluasan wilayah urutan pertama/kedua/ketiga", merek: "Berbeda", tipe: "Spesifikasi sama atau mendekati", tahun: "5 th lebih muda s.d. 5 th lebih tua" },
];

export const KUTIPAN = {
  dasarHukum:
    "Metode perbandingan data harga penjualan lelang: membandingkan data harga penjualan lelang objek sejenis yang disesuaikan dengan karakteristik usia kendaraan (tahun pembuatan), merek dan tipe, lokasi transaksi, dan waktu transaksi.",
  waktuLelang:
    "Tahun transaksi lelang maksimal 3 (tiga) tahun sebelum tahun dilaksanakannya penilaian oleh Panitia Penaksir. (Tata Cara Penentuan Nilai Taksiran, hal. 10)",
  tahunPembuatan:
    "Tahun pembuatan kendaraan pada data harga penjualan lelang diutamakan sama dengan objek. Dalam hal tidak terdapat tahun pembuatan yang sama, data yang dapat digunakan adalah data tahun kendaraan dalam rentang 5 (lima) tahun lebih tua sampai dengan 5 (lima) tahun lebih muda dari objek. Prioritas data adalah tahun pembuatan yang terdekat. Contoh: objek tahun 2010, data pembanding antara tahun 2005-2015. (Tata Cara Penentuan Nilai Taksiran, hal. 9-10)",
  jumlahData:
    "Data harga penjualan lelang yang digunakan sebagai pembanding berjumlah minimal 3 (tiga) data dan maksimal 7 (tujuh) data. Apabila jumlah total data termasuk data tahapan sebelumnya melebihi 7 (tujuh) data, maka data yang digunakan adalah data yang memiliki nilai terendah pada pencarian terakhir, sehingga total data mencapai 7 (tujuh) data. (Tata Cara Penentuan Nilai Taksiran, hal. 9 dan 14)",
  wilayahBaliNusra:
    "Untuk rencana lokasi pelaksanaan lelang di Bali dan Nusa Tenggara, data dapat diperluas dengan urutan pencarian: a) Pertama: pada wilayah kerja KPKNL yang berada di satu provinsi; b) Kedua: pada wilayah kerja KPKNL Denpasar, Surabaya, dan Sidoarjo; dan c) Ketiga: pada semua wilayah kerja KPKNL di Indonesia. (Tata Cara Penentuan Nilai Taksiran, hal. 11)",
  batamSabang:
    "Perluasan pencarian data berdasarkan wilayah tidak berlaku bagi rencana lokasi pelaksanaan lelang di Kota Batam dan di Kota Sabang. Data harga penjualan lelang di Kota Batam dan di Kota Sabang tidak dapat digunakan sebagai data pembanding untuk objek yang berada di luar Kota Batam atau di Kota Sabang. (Tata Cara Penentuan Nilai Taksiran, hal. 11)",
  penyesuaianWaktu:
    "Penyesuaian tahun transaksi memperhatikan data tahun pelaksanaan lelang dengan tahun dilaksanakannya penentuan nilai taksiran, setiap perbedaan satu tahun dilakukan penyesuaian sebesar 2%. Rumus: (tahun taksiran - tahun lelang) x besar penyesuaian. (Tata Cara Penentuan Nilai Taksiran, hal. 16)",
  penyesuaianTahunPembuatan:
    "Setiap perbedaan satu tahun dilakukan penyesuaian sebesar 5-10% tergantung jenis dan kelas kendaraan: 5% untuk kelas low-end; 7% untuk kelas middle; 10% untuk kelas high-end. Rumus: (tahun pembuatan objek taksiran - tahun pembuatan pada data harga penjualan lelang) x besar penyesuaian. (Tata Cara Penentuan Nilai Taksiran, hal. 17)",
  penyesuaianTipe:
    "Apabila spesifikasi tipe data harga penjualan lelang lebih tinggi (superior) dari objek, besaran penyesuaiannya negatif. Apabila lebih rendah (inferior), besaran penyesuaiannya positif. Besaran penyesuaian 8% per perbedaan kelas tipe kendaraan. (Tata Cara Penentuan Nilai Taksiran, hal. 18-19)",
  penyesuaianMerek:
    "Penyesuaian terhadap merek hanya dilaksanakan dalam hal objek penilaian memiliki merek yang tidak terdapat dalam data harga penjualan lelang. Rumus: Fpm = (NJT - NJP) / NJP. Fpm: Faktor Penyesuaian Merek; NJT: harga baru objek yang akan ditentukan nilai taksirannya; NJP: harga baru objek pembanding. Dalam hal objek sudah tidak diproduksi lagi, NJT atau NJP dapat menggunakan harga jual saat ini di pasar. (Tata Cara Penentuan Nilai Taksiran, hal. 21)",
  penyesuaianLokasi:
    "Penyesuaiannya berkisar 5% per perbedaan kategori lokasi. Jika objek berada di lokasi dengan tingkat harga lebih tinggi daripada pembanding maka penyesuaian positif; jika lebih rendah maka penyesuaian negatif. Kategori 1 memiliki tingkat harga tertinggi dan kategori 4 terendah. (Tata Cara Penentuan Nilai Taksiran, hal. 23)",
  faktorKondisiLelang:
    "Untuk penjualan secara lelang, nilai rata-rata dikalikan faktor kondisi: 0,5 untuk tingkat kerusakan di atas 90%; 0,6 untuk di atas 80% sampai dengan 90%; 0,7 untuk sampai dengan 80%. Dikecualikan untuk objek tanpa dokumen kepemilikan, besaran faktor pengali adalah 0,5. (Tata Cara Penentuan Nilai Taksiran, hal. 9)",
  faktorKondisiTanpaLelang:
    "Untuk penjualan tanpa melalui lelang, nilai rata-rata dikalikan faktor kondisi: 0,8 untuk tingkat kerusakan di atas 90%; 0,9 untuk di atas 80% sampai dengan 90%; 1,0 untuk sampai dengan 80%. Hasil pengalian menjadi nilai taksiran. (Tata Cara Penentuan Nilai Taksiran, hal. 8)",
  pembulatan:
    "Nilai akhir dibulatkan ke atas pada ribuan rupiah: ceil(nilai / 1.000) x 1.000. Contoh: Rp377.696,07 menjadi Rp378.000,00.",
  masaBerlaku:
    "Nilai taksiran yang tertuang dalam kertas kerja penentuan nilai taksiran berlaku 6 bulan sejak tanggal penentuan nilai taksiran. (Tata Cara Penentuan Nilai Taksiran, hal. 25)",
  kertasKerja:
    "Kertas kerja penentuan nilai taksiran minimal memuat: nomor dan tanggal kertas kerja; identitas objek; data lelang yang digunakan; proses penyesuaian data (merek, tipe, tahun transaksi, lokasi, dan tahun pembuatan); indikasi harga taksiran; kesimpulan nilai taksiran; kesimpulan nilai limit lelang; serta nama dan tanda tangan Panitia Penaksir. (Tata Cara Penentuan Nilai Taksiran, hal. 24-25)",
  klasifikasiCC:
    "Roda dua/tiga: low-end s.d. 100cc; middle di atas 100cc s.d. 150cc; high-end di atas 150cc. Roda empat atau lebih: low-end s.d. 1.200cc; middle di atas 1.200cc s.d. 2.500cc; high-end di atas 2.500cc. (Tata Cara Penentuan Nilai Taksiran, hal. 7-8)",
} as const;

export const KETERANGAN_MEREK = {
  njr: "Objek sejenis dengan objek yang akan ditentukan nilai taksirannya",
  pembanding:
    "Objek dengan merek berbeda namun memiliki spesifikasi yang sama",
} as const;
