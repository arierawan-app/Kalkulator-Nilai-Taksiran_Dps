import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  PageBreak,
  PageOrientation,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlignTable,
  WidthType,
  convertMillimetersToTwip,
} from "docx";
import {
  hitungFaktorKondisi,
  hitungRekap,
  klasifikasiKendaraan,
  punyaDokumenKepemilikan,
} from "./calc";
import { KETERANGAN_MEREK, LABEL_TINGKAT, LABEL_TINGKAT_TANPA_LELANG } from "./ketentuan";
import { formatRp, formatTanggalIndonesia } from "./format";
import { DOKUMEN_KEPEMILIKAN } from "./types";
import type { Dokumen, MerekRow } from "./types";

const FONT = "Arial";
const LEBAR_KONTEN = convertMillimetersToTwip(186);
const MARGIN_SEL = { top: 25, bottom: 25, left: 45, right: 45 };

const GARIS_TIDAK_ADA = {
  style: BorderStyle.NONE,
  size: 0,
  color: "FFFFFF",
} as const;

const BORDER_TABEL = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  insideH: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
  insideV: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
};

const BORDER_SEL = {
  top: GARIS_TIDAK_ADA,
  bottom: GARIS_TIDAK_ADA,
  left: GARIS_TIDAK_ADA,
  right: GARIS_TIDAK_ADA,
};

const BORDER_TABEL_TIDAK_ADA = {
  ...BORDER_SEL,
  insideH: GARIS_TIDAK_ADA,
  insideV: GARIS_TIDAK_ADA,
};

type Perataan = (typeof AlignmentType)[keyof typeof AlignmentType];

type OpsiParagraf = {
  alignment?: Perataan;
  bold?: boolean;
  underline?: boolean;
  size?: number;
  before?: number;
  after?: number;
  color?: string;
};

type SelWord = {
  text?: string;
  span?: number;
  bold?: boolean;
  fontSize?: number;
  alignment?: Perataan;
  fill?: string;
  paragraphs?: Paragraph[];
};

function paragraf(teks: string, opsi: OpsiParagraf = {}): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: teks,
        font: FONT,
        size: opsi.size ?? 18,
        bold: opsi.bold ?? false,
        ...(opsi.underline ? { underline: { type: "single" as const } } : {}),
        color: opsi.color ?? "000000",
      }),
    ],
    alignment: opsi.alignment ?? AlignmentType.LEFT,
    spacing: {
      before: opsi.before ?? 0,
      after: opsi.after ?? 0,
      line: 210,
    },
  });
}

function lebarKolom(bobot: number[]): number[] {
  const jumlahBobot = bobot.reduce((jumlah, nilai) => jumlah + nilai, 0);
  let sudahTerbagi = 0;
  let sebelumnya = 0;

  return bobot.map((nilai, indeks) => {
    sudahTerbagi += nilai;
    const batas =
      indeks === bobot.length - 1
        ? LEBAR_KONTEN
        : Math.round((LEBAR_KONTEN * sudahTerbagi) / jumlahBobot);
    const lebar = batas - sebelumnya;
    sebelumnya = batas;
    return lebar;
  });
}

function buatTabel(
  bobot: number[],
  baris: SelWord[][],
  bergaris: boolean
): Table {
  const widths = lebarKolom(bobot);

  return new Table({
    width: { size: LEBAR_KONTEN, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    borders: bergaris ? BORDER_TABEL : BORDER_TABEL_TIDAK_ADA,
    rows: baris.map(
      (selBaris) =>
        new TableRow({
          cantSplit: true,
          children: selBaris.map(
            (sel) =>
              new TableCell({
                children:
                  sel.paragraphs ?? [
                    paragraf(sel.text ?? "", {
                      bold: sel.bold,
                      size: sel.fontSize ?? (bergaris ? 16 : 18),
                      alignment: sel.alignment,
                    }),
                  ],
                ...(sel.span ? { columnSpan: sel.span } : {}),
                ...(sel.fill ? { shading: { fill: sel.fill } } : {}),
                verticalAlign: VerticalAlignTable.CENTER,
                margins: MARGIN_SEL,
                borders: bergaris ? BORDER_TABEL : BORDER_SEL,
              })
          ),
        })
    ),
  });
}

function judulBagian(
  teks: string,
  rata: Perataan = AlignmentType.LEFT
): Paragraph {
  return paragraf(teks, {
    alignment: rata,
    bold: true,
    size: 19,
    before: 95,
    after: 35,
  });
}

function gambarLogo(dataUrl: string): ImageRun | null {
  const jenis = dataUrl.match(/^data:image\/(png|jpe?g);base64,/i)?.[1];
  if (!jenis) return null;

  return new ImageRun({
    type: jenis.toLowerCase() === "png" ? "png" : "jpg",
    data: dataUrl,
    transformation: { width: 54, height: 54 },
  });
}

function buatKop(dok: Dokumen): Table {
  const tujuan =
    dok.satker.tujuan === "lelang"
      ? "TUJUAN PEMINDAHTANGANAN DENGAN PENJUALAN SECARA LELANG"
      : "TUJUAN PEMINDAHTANGANAN DENGAN PENJUALAN TANPA MELALUI LELANG";
  const logo = dok.satker.logoDataUrl
    ? gambarLogo(dok.satker.logoDataUrl)
    : null;

  return new Table({
    width: { size: LEBAR_KONTEN, type: WidthType.DXA },
    columnWidths: [
      convertMillimetersToTwip(16),
      convertMillimetersToTwip(154),
      convertMillimetersToTwip(16),
    ],
    layout: TableLayoutType.FIXED,
    borders: BORDER_TABEL_TIDAK_ADA,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: logo ? [logo] : [new TextRun(" ")],
                alignment: AlignmentType.CENTER,
                spacing: { after: 0 },
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            borders: BORDER_SEL,
          }),
          new TableCell({
            children: [
              paragraf("KERTAS KERJA ANALISIS PENETUAN NILAI TAKSIRAN BMN", {
                alignment: AlignmentType.CENTER,
                bold: true,
                size: 20,
              }),
              paragraf(dok.satker.namaKementerian || "KEMENTERIAN/LEMBAGA", {
                alignment: AlignmentType.CENTER,
                bold: true,
                size: 19,
              }),
              paragraf(tujuan, {
                alignment: AlignmentType.CENTER,
                bold: true,
                size: 18,
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            borders: BORDER_SEL,
          }),
          new TableCell({
            children: [paragraf(" ")],
            borders: BORDER_SEL,
          }),
        ],
      }),
    ],
  });
}

function teksDokumenKepemilikan(dok: Dokumen): string {
  return DOKUMEN_KEPEMILIKAN.map((pilihan) => {
    const dipilih = dok.objek.dokumen.includes(pilihan);
    const keteranganLainnya =
      pilihan === "Lainnya" && dipilih
        ? `: ${dok.objek.dokumenLainnya || "..."}`
        : "";
    return `[${dipilih ? "V" : " "}] ${pilihan}${keteranganLainnya}`;
  })
    .join("   ");
}

function buatTabelIdentifikasi(dok: Dokumen): Table {
  const { objek } = dok;
  const kelas = objek.cc
    ? klasifikasiKendaraan(objek.jenisKendaraan, objek.cc)
    : null;
  const jenisKendaraan =
    `: [${objek.jenisKendaraan === "roda23" ? "V" : " "}] Roda 2 atau 3  ` +
    `[${objek.jenisKendaraan === "roda4plus" ? "V" : " "}] Roda 4 atau lebih` +
    (objek.cc ? ` (${objek.cc} cc${kelas ? `, ${kelas}` : ""})` : "");
  const barisPenuh = (huruf: string, label: string, nilai: string): SelWord[] => [
    { text: huruf },
    { text: label },
    { text: `: ${nilai}`, span: 3 },
  ];
  const barisSub = (label: string, nilai: string): SelWord[] => [
    { text: "" },
    { text: label },
    { text: `: ${nilai}`, span: 3 },
  ];

  return buatTabel(
    [4, 28, 26, 18, 24],
    [
      [
        { text: "a." },
        { text: "Nama Objek" },
        { text: `: ${objek.namaObjek}` },
        { text: "NUP" },
        { text: `: ${objek.nup || "-"}` },
      ],
      [
        { text: "b." },
        { text: "Lokasi Objek" },
        { text: `: ${objek.lokasiObjek}` },
        { text: "Kategori Lokasi" },
        { text: `: ${objek.kategoriLokasi}` },
      ],
      barisPenuh("c.", "Jenis Kendaraan", jenisKendaraan),
      barisPenuh("d.", "Merek Kendaraan", objek.merek),
      barisPenuh("e.", "Tipe Kendaraan", objek.tipe),
      [{ text: "f." }, { text: "Identitas Kendaraan :", span: 4 }],
      barisSub("(i) Nomor Polisi", objek.nomorPolisi || "-"),
      barisSub("(ii) Dokumen Kepemilikan", teksDokumenKepemilikan(dok)),
      barisSub("(iii) Pemilik Dokumen", objek.pemilikDokumen || "-"),
      barisSub(
        "(iv) Masa Berlaku",
        `${objek.masaBerlaku}${objek.keteranganMasaBerlaku ? ` - Keterangan: ${objek.keteranganMasaBerlaku}` : ""}`
      ),
      barisSub("(v) Penggunaan Kendaraan", objek.penggunaan || "-"),
      barisSub("(vi) Keterangan Lain", objek.keteranganLain || "-"),
    ],
    false
  );
}

function buatTabelFisik(dok: Dokumen): Table {
  const { objek, satker } = dok;
  const labelTingkat =
    satker.tujuan === "lelang" ? LABEL_TINGKAT : LABEL_TINGKAT_TANPA_LELANG;
  return buatTabel(
    [4, 22, 26, 20, 28],
    [
      [
        { text: "a." },
        { text: "Warna" },
        { text: `: ${objek.warna}` },
        { text: "d. Kondisi Kendaraan :" },
        { text: "" },
      ],
      [
        { text: "b." },
        { text: "Tahun Pembuatan" },
        { text: `: ${objek.tahunPembuatan}` },
        {
          text: `[${objek.tingkatKerusakan === "di_atas_90" ? "V" : " "}] ${labelTingkat.di_atas_90}`,
          span: 2,
        },
      ],
      [
        { text: "c." },
        { text: "Bahan Bakar" },
        { text: `: ${objek.bahanBakar}` },
        {
          text: `[${objek.tingkatKerusakan === "80_sampai_90" ? "V" : " "}] ${labelTingkat["80_sampai_90"]}`,
          span: 2,
        },
      ],
      [
        { text: "" },
        { text: "" },
        { text: "" },
        {
          text: `[${objek.tingkatKerusakan === "sampai_80" ? "V" : " "}] ${labelTingkat.sampai_80}`,
          span: 2,
        },
      ],
    ],
    false
  );
}

function buatTabelLelang(dok: Dokumen): Table {
  const bobot = [5, 12, 11, 16, 17, 9, 7, 5, 18];
  const baris: SelWord[][] = [
    [
      { text: "No.", bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
      { text: "Data Hasil Lelang", bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
      { text: "Kode Lelang", bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
      { text: "Tipe", bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
      { text: "Harga Lelang", bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
      { text: "Waktu Lelang", bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
      { text: "Kategori Lokasi Lelang", span: 2, bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
      { text: "Tahun Pembuatan", bold: true, fill: "EEEEEE", alignment: AlignmentType.CENTER },
    ],
  ];

  dok.lelang.forEach((row, indeks) => {
    baris.push([
      { text: `${indeks + 1}.`, alignment: AlignmentType.CENTER },
      { text: row.merek },
      { text: row.kodeLelang },
      { text: row.tipe },
      { text: formatRp(row.harga), alignment: AlignmentType.RIGHT },
      { text: String(row.waktuLelang), alignment: AlignmentType.CENTER },
      { text: row.namaKPKNL.replace(/^KPKNL\s+/i, "") || "-" },
      { text: String(row.kategoriLokasi), alignment: AlignmentType.CENTER },
      { text: String(row.tahunPembuatan), alignment: AlignmentType.CENTER },
    ]);
  });

  return buatTabel(bobot, baris, true);
}

function buatTabelPenyesuaian(dok: Dokumen): Table {
  const punyaDokumen = punyaDokumenKepemilikan(dok.objek.dokumen);
  const faktor = hitungFaktorKondisi(
    dok.satker.tujuan,
    dok.objek.tingkatKerusakan,
    punyaDokumen
  );
  const rekap = hitungRekap(dok.lelang, faktor);
  const bobot = [5, 12, 9, 9, 9, 9, 13, 9, 25];
  const baris: SelWord[][] = [
    [
      "No.",
      "Data Hasil Lelang",
      "Tipe",
      "Merek",
      "Waktu",
      "Lokasi",
      "Tahun Pembuatan",
      "Total",
      "Nilai Taksiran",
    ].map((teks) => ({
      text: teks,
      bold: true,
      fill: "EEEEEE",
      alignment: AlignmentType.CENTER,
    })),
  ];

  rekap.baris.forEach((hasil, indeks) => {
    baris.push([
      { text: `${indeks + 1}.`, alignment: AlignmentType.CENTER },
      { text: hasil.row.merek },
      { text: `${hasil.row.adjTipe}%`, alignment: AlignmentType.CENTER },
      { text: `${hasil.row.adjMerek}%`, alignment: AlignmentType.CENTER },
      { text: `${hasil.row.adjWaktu}%`, alignment: AlignmentType.CENTER },
      { text: `${hasil.row.adjLokasi}%`, alignment: AlignmentType.CENTER },
      { text: `${hasil.row.adjTahun}%`, alignment: AlignmentType.CENTER },
      { text: `${hasil.totalPersen}%`, bold: true, alignment: AlignmentType.CENTER },
      { text: formatRp(hasil.nilaiTaksiran), bold: true, alignment: AlignmentType.RIGHT },
    ]);
  });

  const barisRingkasan = (label: string, nilai: string, fill?: string): SelWord[] => [
    { text: label, span: 8, bold: true, fill, alignment: AlignmentType.RIGHT },
    { text: nilai, bold: true, fill, alignment: AlignmentType.RIGHT },
  ];

  baris.push(
    barisRingkasan("Nilai Taksiran", formatRp(rekap.total)),
    barisRingkasan("Rata-rata Nilai Taksiran", formatRp(rekap.rataRata)),
    barisRingkasan(
      `Taksiran Nilai Limit Lelang (x ${faktor.toString().replace(".", ",")})`,
      formatRp(rekap.limit)
    ),
    barisRingkasan("Pembulatan", formatRp(rekap.pembulatan), "EEEEEE")
  );

  return buatTabel(bobot, baris, true);
}

function buatTandaTangan(dok: Dokumen): Table[] {
  const kotaTanggal = dok.panitia.tanggal
    ? `${dok.panitia.kota}, ${formatTanggalIndonesia(dok.panitia.tanggal)}`
    : `${dok.panitia.kota}, ........................`;
  const anggota = dok.panitia.anggota;
  const bobotAnggota = anggota.length > 0 ? anggota.map(() => 1) : [1];
  const selAnggota =
    anggota.length > 0
      ? anggota.map((orang) => ({
          paragraphs: [
            paragraf(" ", { after: 1150 }),
            paragraf(orang.jabatan, { alignment: AlignmentType.CENTER }),
            paragraf(orang.nama || " ", { alignment: AlignmentType.CENTER }),
            paragraf(orang.nip ? `NIP. ${orang.nip}` : " ", {
              alignment: AlignmentType.CENTER,
            }),
          ],
        }))
      : [{ text: "" }];

  return [
    buatTabel(
      [55, 45],
      [[
        { text: "" },
        {
          paragraphs: [
            paragraf(kotaTanggal),
            paragraf("Panitia Penaksir"),
          ],
        },
      ]],
      false
    ),
    buatTabel(bobotAnggota, [selAnggota], false),
  ];
}

function hitungFpm(row: MerekRow, njt: MerekRow | undefined): number | null {
  if (row.peran === "NJT") return 0;
  if (!njt || njt.harga <= 0 || row.harga <= 0) return null;
  return Math.round(((njt.harga - row.harga) / row.harga) * 100);
}

function buatLembarMerek(dok: Dokumen): (Paragraph | Table)[] {
  const njt = dok.merek.find((row) => row.peran === "NJT");
  const isi: (Paragraph | Table)[] = [
    new Paragraph({ children: [new PageBreak()] }),
    buatKop(dok),
    paragraf("(Lembar Kedua)", {
      alignment: AlignmentType.CENTER,
      bold: true,
      size: 18,
      after: 25,
    }),
    paragraf("Perhitungan Besaran Penyesuaian Merek", {
      alignment: AlignmentType.CENTER,
      bold: true,
      underline: true,
      size: 19,
      after: 90,
    }),
    buatTabel(
      [45, 55],
      [
        [
          {
            paragraphs: [
              paragraf("Rumusan", {
                alignment: AlignmentType.CENTER,
                bold: true,
                after: 30,
              }),
              paragraf("Fpm = (NJT - NJP) / NJP", {
                alignment: AlignmentType.CENTER,
              }),
            ],
          },
          {
            paragraphs: [
              paragraf("Fpm : Faktor Penyesuaian Merek"),
              paragraf("NJT : Harga baru objek yang ditaksir"),
              paragraf("NJP : Harga baru objek pembanding"),
            ],
          },
        ],
      ],
      true
    ),
    paragraf(" ", { after: 30 }),
  ];

  const baris: SelWord[][] = [
    [
      "No.",
      "Merek",
      "Harga Baru/Harga Jual Saat Ini",
      "Besaran Penyesuaian (Fpm)",
      "Keterangan",
    ].map((teks) => ({
      text: teks,
      bold: true,
      fill: "EEEEEE",
      alignment: AlignmentType.CENTER,
    })),
  ];

  dok.merek.forEach((row, indeks) => {
    const fpm = hitungFpm(row, njt);
    const keterangan =
      row.keterangan ||
      (row.peran === "NJT" ? KETERANGAN_MEREK.njr : KETERANGAN_MEREK.pembanding);
    baris.push([
      { text: `${indeks + 1}.`, alignment: AlignmentType.CENTER },
      { text: row.merek },
      { text: formatRp(row.harga), alignment: AlignmentType.RIGHT },
      {
        text: `${row.peran}${fpm !== null ? ` (${fpm}%)` : ""}`,
        alignment: AlignmentType.CENTER,
      },
      { text: keterangan },
    ]);
  });

  isi.push(buatTabel([5, 18, 22, 17, 38], baris, true));
  return isi;
}

export function buatDokumenWord(dok: Dokumen): Document {
  const punyaDokumen = punyaDokumenKepemilikan(dok.objek.dokumen);
  const faktor = hitungFaktorKondisi(
    dok.satker.tujuan,
    dok.objek.tingkatKerusakan,
    punyaDokumen
  );
  const rekap = hitungRekap(dok.lelang, faktor);
  const anak: (Paragraph | Table)[] = [
    buatKop(dok),
    buatTabel(
      [42, 58],
      [[
        { text: "Nomor Kertas Kerja" },
        { text: `: ${dok.satker.nomorKertasKerja}` },
      ]],
      false
    ),
    judulBagian("1. Identifikasi"),
    buatTabelIdentifikasi(dok),
    judulBagian("2. Fisik Kendaraan"),
    buatTabelFisik(dok),
    judulBagian("DATA HASIL LELANG", AlignmentType.CENTER),
    buatTabelLelang(dok),
    judulBagian("PENYESUAIAN", AlignmentType.CENTER),
    buatTabelPenyesuaian(dok),
    paragraf(" ", { after: 70 }),
    ...buatTandaTangan(dok),
  ];

  if (dok.merek.length > 0) {
    anak.push(...buatLembarMerek(dok));
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.PORTRAIT,
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297),
            },
            margin: {
              top: convertMillimetersToTwip(12),
              right: convertMillimetersToTwip(12),
              bottom: convertMillimetersToTwip(12),
              left: convertMillimetersToTwip(12),
            },
          },
        },
        children: anak,
      },
    ],
  });
}

export async function buatBerkasWord(dok: Dokumen): Promise<Blob> {
  return Packer.toBlob(buatDokumenWord(dok));
}
