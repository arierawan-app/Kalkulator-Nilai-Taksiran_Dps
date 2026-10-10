import type { CSSProperties } from "react";
import {
  LABEL_TINGKAT,
  LABEL_TINGKAT_TANPA_LELANG,
} from "@/lib/ketentuan";
import {
  hitungFaktorKondisi,
  hitungRekap,
  klasifikasiKendaraan,
} from "@/lib/calc";
import { formatRp, formatTanggalIndonesia } from "@/lib/format";
import { KETERANGAN_MEREK } from "@/lib/ketentuan";
import type { Dokumen, MerekRow } from "@/lib/types";

const serif: CSSProperties = { fontFamily: "'Times New Roman', Times, serif" };
const tdBorder: CSSProperties = {
  border: "1px solid #000",
  padding: "3px 5px",
  verticalAlign: "top",
};
const thBorder: CSSProperties = {
  ...tdBorder,
  textAlign: "center",
  fontWeight: "bold",
};
const noBorder: CSSProperties = { padding: "1px 3px", verticalAlign: "top" };

function Kotak({ aktif }: { aktif: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "13px",
        height: "13px",
        border: "1px solid #000",
        textAlign: "center",
        fontSize: "11px",
        lineHeight: "12px",
        fontWeight: "bold",
        marginRight: "5px",
        verticalAlign: "middle",
      }}
    >
      {aktif ? "V" : ""}
    </span>
  );
}

function Kop({ dok }: { dok: Dokumen }) {
  const tujuan =
    dok.satker.tujuan === "lelang"
      ? "TUJUAN PEMINDAHTANGANAN DENGAN PENJUALAN SECARA LELANG"
      : "TUJUAN PEMINDAHTANGANAN DENGAN PENJUALAN TANPA MELALUI LELANG";
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
      <tbody>
        <tr>
          <td style={{ ...noBorder, width: "70px" }}>
            {dok.satker.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dok.satker.logoDataUrl}
                alt="Logo"
                style={{ width: "64px", height: "64px", objectFit: "contain" }}
              />
            ) : null}
          </td>
          <td style={{ ...noBorder, textAlign: "center" }}>
            <div style={{ fontSize: "13px", fontWeight: "bold" }}>
              KERTAS KERJA ANALISIS PENETUAN NILAI TAKSIRAN BMN
            </div>
            <div style={{ fontSize: "13px", fontWeight: "bold" }}>
              {dok.satker.namaKementerian || "KEMENTERIAN/LEMBAGA"}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "bold" }}>{tujuan}</div>
          </td>
          <td style={{ ...noBorder, width: "70px" }} />
        </tr>
      </tbody>
    </table>
  );
}

function LembarPertama({ dok }: { dok: Dokumen }) {
  const { objek, satker, panitia } = dok;
  const punyaDokumen = objek.dokumen !== "Tidak ada";
  const faktor = hitungFaktorKondisi(
    satker.tujuan,
    objek.tingkatKerusakan,
    punyaDokumen
  );
  const rekap = hitungRekap(dok.lelang, faktor);
  const labelTingkat =
    satker.tujuan === "lelang" ? LABEL_TINGKAT : LABEL_TINGKAT_TANPA_LELANG;
  const kelas = objek.cc
    ? klasifikasiKendaraan(objek.jenisKendaraan, objek.cc)
    : null;
  const celah = Array.from({ length: Math.max(0, 7 - dok.lelang.length) });
  const kolomHasilLelang = [
    { label: "No.", lebar: "5%" },
    { label: "Data Hasil Lelang", lebar: "13%" },
    { label: "Kode Lelang", lebar: "11%" },
    { label: "Tipe", lebar: "14%" },
    { label: "Harga Lelang", lebar: "15%" },
    { label: "Waktu Lelang", lebar: "8%" },
    { label: "Kategori Lokasi Lelang", lebar: "18%" },
    { label: "Tahun Pembuatan", lebar: "9%" },
  ];

  return (
    <div style={{ ...serif, color: "#000", fontSize: "11px" }}>
      <Kop dok={dok} />

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
        <tbody>
          <tr>
            <td style={{ ...noBorder, width: "150px" }}>Nomor Kertas Kerja</td>
            <td style={noBorder}>: {satker.nomorKertasKerja}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ fontWeight: "bold", fontSize: "12px", marginBottom: "3px" }}>
        1. Identifikasi
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...noBorder, width: "18px" }}>a.</td>
            <td style={{ ...noBorder, width: "120px" }}>Nama Objek</td>
            <td style={{ ...noBorder, width: "240px" }}>: {objek.namaObjek}</td>
            <td style={{ ...noBorder, width: "45px" }}>NUP</td>
            <td style={noBorder}>: {objek.nup || "-"}</td>
          </tr>
          <tr>
            <td style={noBorder}>b.</td>
            <td style={noBorder}>Lokasi Objek</td>
            <td style={noBorder}>: {objek.lokasiObjek}</td>
            <td style={noBorder}>Kategori Lokasi</td>
            <td style={noBorder}>: {objek.kategoriLokasi}</td>
          </tr>
          <tr>
            <td style={noBorder}>c.</td>
            <td style={noBorder}>Jenis Kendaraan</td>
            <td style={noBorder} colSpan={3}>
              : <Kotak aktif={objek.jenisKendaraan === "roda23"} /> Roda 2 atau 3{" "}
              <span style={{ display: "inline-block", width: "14px" }} />
              <Kotak aktif={objek.jenisKendaraan === "roda4plus"} /> Roda 4 atau
              lebih
              {objek.cc ? ` (${objek.cc} cc${kelas ? `, ${kelas}` : ""})` : ""}
            </td>
          </tr>
          <tr>
            <td style={noBorder}>d.</td>
            <td style={noBorder}>Merek Kendaraan</td>
            <td style={noBorder} colSpan={3}>
              : {objek.merek}
            </td>
          </tr>
          <tr>
            <td style={noBorder}>e.</td>
            <td style={noBorder}>Tipe Kendaraan</td>
            <td style={noBorder} colSpan={3}>
              : {objek.tipe}
            </td>
          </tr>
          <tr>
            <td style={noBorder}>f.</td>
            <td style={noBorder} colSpan={4}>
              Identitas Kendaraan :
            </td>
          </tr>
          <tr>
            <td style={noBorder} />
            <td style={noBorder}>(i) Nomor Polisi</td>
            <td style={noBorder} colSpan={3}>
              : {objek.nomorPolisi || "-"}
            </td>
          </tr>
          <tr>
            <td style={noBorder} />
            <td style={noBorder}>(ii) Dokumen Kepemilikan</td>
            <td style={noBorder} colSpan={3}>
              : <Kotak aktif={objek.dokumen === "BPKB"} /> BPKB{" "}
              <Kotak aktif={objek.dokumen === "STNK"} /> STNK{" "}
              <Kotak aktif={objek.dokumen === "Lainnya"} /> Lainnya ...{" "}
              <Kotak aktif={objek.dokumen === "Tidak ada"} /> Tidak ada
            </td>
          </tr>
          <tr>
            <td style={noBorder} />
            <td style={noBorder}>(iii) Pemilik Dokumen</td>
            <td style={noBorder} colSpan={3}>
              : {objek.pemilikDokumen || "-"}
            </td>
          </tr>
          <tr>
            <td style={noBorder} />
            <td style={noBorder}>(iv) Masa Berlaku</td>
            <td style={noBorder} colSpan={3}>
              : <Kotak aktif={objek.masaBerlaku === "Masih berlaku"} /> Masih
              Berlaku <Kotak aktif={objek.masaBerlaku === "Habis masa berlaku"} />{" "}
              Habis Masa Berlaku
              {objek.keteranganMasaBerlaku
                ? ` - Keterangan: ${objek.keteranganMasaBerlaku}`
                : ""}
            </td>
          </tr>
          <tr>
            <td style={noBorder} />
            <td style={noBorder}>(v) Penggunaan Kendaraan</td>
            <td style={noBorder} colSpan={3}>
              : {objek.penggunaan || "-"}
            </td>
          </tr>
          <tr>
            <td style={noBorder} />
            <td style={noBorder}>(vi) Keterangan Lain</td>
            <td style={noBorder} colSpan={3}>
              : {objek.keteranganLain || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          fontWeight: "bold",
          fontSize: "12px",
          marginTop: "8px",
          marginBottom: "3px",
        }}
      >
        2. Fisik Kendaraan
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ ...noBorder, width: "18px" }}>a.</td>
            <td style={{ ...noBorder, width: "120px" }}>Warna</td>
            <td style={{ ...noBorder, width: "240px" }}>: {objek.warna}</td>
            <td style={{ ...noBorder, width: "110px" }}>d. Kondisi Kendaraan</td>
            <td style={noBorder}>
              : <Kotak aktif={objek.tingkatKerusakan === "di_atas_90"} />{" "}
              {labelTingkat.di_atas_90}
            </td>
          </tr>
          <tr>
            <td style={noBorder}>b.</td>
            <td style={noBorder}>Tahun Pembuatan</td>
            <td style={noBorder}>: {objek.tahunPembuatan}</td>
            <td style={noBorder} />
            <td style={noBorder}>
              <Kotak aktif={objek.tingkatKerusakan === "80_sampai_90"} />{" "}
              {labelTingkat["80_sampai_90"]}
            </td>
          </tr>
          <tr>
            <td style={noBorder}>c.</td>
            <td style={noBorder}>Bahan Bakar</td>
            <td style={noBorder}>: {objek.bahanBakar}</td>
            <td style={noBorder} />
            <td style={noBorder}>
              <Kotak aktif={objek.tingkatKerusakan === "sampai_80"} />{" "}
              {labelTingkat.sampai_80}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          fontWeight: "bold",
          fontSize: "12px",
          textAlign: "center",
          marginTop: "8px",
          marginBottom: "3px",
        }}
      >
        DATA HASIL LELANG
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {kolomHasilLelang.map((k) => (
              <th key={k.label} style={{ ...thBorder, width: k.lebar }}>
                {k.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dok.lelang.map((row, i) => {
            const lokasi = row.namaKPKNL.replace(/^KPKNL\s+/i, "");
            return (
              <tr key={row.id}>
                <td style={{ ...tdBorder, textAlign: "center" }}>{i + 1}.</td>
                <td style={tdBorder}>{row.merek}</td>
                <td style={tdBorder}>{row.kodeLelang}</td>
                <td style={tdBorder}>{row.tipe}</td>
                <td style={{ ...tdBorder, textAlign: "right" }}>
                  {formatRp(row.harga)}
                </td>
                <td style={{ ...tdBorder, textAlign: "center" }}>
                  {row.waktuLelang}
                </td>
                <td style={tdBorder}>
                  {lokasi || "-"}
                  <br />
                  {row.kategoriLokasi}
                </td>
                <td style={{ ...tdBorder, textAlign: "center" }}>
                  {row.tahunPembuatan}
                </td>
              </tr>
            );
          })}
          {celah.map((_, i) => (
            <tr key={`kosong-${i}`}>
              <td style={{ ...tdBorder, textAlign: "center" }}>
                {dok.lelang.length + i + 1}.
              </td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          fontWeight: "bold",
          fontSize: "12px",
          textAlign: "center",
          marginTop: "8px",
          marginBottom: "3px",
        }}
      >
        PENYESUAIAN
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thBorder, width: "5%" }}>No.</th>
            <th style={{ ...thBorder, width: "16%" }}>Data Hasil Lelang</th>
            <th style={{ ...thBorder, width: "8%" }}>Tipe</th>
            <th style={{ ...thBorder, width: "8%" }}>Merek</th>
            <th style={{ ...thBorder, width: "8%" }}>Waktu</th>
            <th style={{ ...thBorder, width: "8%" }}>Lokasi</th>
            <th style={{ ...thBorder, width: "11%" }}>Tahun Pembuatan</th>
            <th style={{ ...thBorder, width: "8%" }}>Total</th>
            <th style={{ ...thBorder, width: "18%" }}>Nilai Taksiran</th>
          </tr>
        </thead>
        <tbody>
          {rekap.baris.map((b, i) => (
            <tr key={b.row.id}>
              <td style={{ ...tdBorder, textAlign: "center" }}>{i + 1}.</td>
              <td style={tdBorder}>{b.row.merek}</td>
              <td style={{ ...tdBorder, textAlign: "center" }}>
                {b.row.adjTipe}%
              </td>
              <td style={{ ...tdBorder, textAlign: "center" }}>
                {b.row.adjMerek}%
              </td>
              <td style={{ ...tdBorder, textAlign: "center" }}>
                {b.row.adjWaktu}%
              </td>
              <td style={{ ...tdBorder, textAlign: "center" }}>
                {b.row.adjLokasi}%
              </td>
              <td style={{ ...tdBorder, textAlign: "center" }}>
                {b.row.adjTahun}%
              </td>
              <td style={{ ...tdBorder, textAlign: "center", fontWeight: "bold" }}>
                {b.totalPersen}%
              </td>
              <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
                {formatRp(b.nilaiTaksiran)}
              </td>
            </tr>
          ))}
          {celah.map((_, i) => (
            <tr key={`kosong-adj-${i}`}>
              <td style={{ ...tdBorder, textAlign: "center" }}>
                {rekap.baris.length + i + 1}.
              </td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
              <td style={tdBorder}>&nbsp;</td>
            </tr>
          ))}
          <tr>
            <td style={{ ...tdBorder, border: "none" }} colSpan={7} />
            <td
              style={{
                ...tdBorder,
                textAlign: "right",
                fontWeight: "bold",
              }}
              colSpan={1}
            >
              Nilai Taksiran
            </td>
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              {formatRp(rekap.total)}
            </td>
          </tr>
          <tr>
            <td style={{ ...tdBorder, border: "none" }} colSpan={7} />
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              Rata-rata Nilai Taksiran
            </td>
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              {formatRp(rekap.rataRata)}
            </td>
          </tr>
          <tr>
            <td style={{ ...tdBorder, border: "none" }} colSpan={7} />
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              Taksiran Nilai Limit Lelang (x{" "}
              {faktor.toString().replace(".", ",")})
            </td>
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              {formatRp(rekap.limit)}
            </td>
          </tr>
          <tr>
            <td style={{ ...tdBorder, border: "none" }} colSpan={7} />
            <td
              style={{
                ...tdBorder,
                textAlign: "right",
                fontWeight: "bold",
                backgroundColor: "#eeeeee",
              }}
            >
              Pembulatan
            </td>
            <td
              style={{
                ...tdBorder,
                textAlign: "right",
                fontWeight: "bold",
                backgroundColor: "#eeeeee",
              }}
            >
              {formatRp(rekap.pembulatan)}
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
        <tbody>
          <tr>
            <td style={{ ...noBorder, width: "55%" }} />
            <td style={noBorder}>
              <div>
                {panitia.kota}
                {panitia.tanggal
                  ? `, ${formatTanggalIndonesia(panitia.tanggal)}`
                  : ", ........................"}
              </div>
              <div style={{ marginTop: "2px" }}>Panitia Penaksir</div>
            </td>
          </tr>
        </tbody>
      </table>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "4px",
        }}
      >
        <tbody>
          <tr>
            {panitia.anggota.map((a) => (
              <td
                key={a.id}
                style={{ ...noBorder, textAlign: "center", width: `${100 / Math.max(1, panitia.anggota.length)}%` }}
              >
                <div style={{ height: "52px" }} />
                <div>({a.jabatan})</div>
                {a.nama ? <div>{a.nama}</div> : null}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function LembarKedua({ dok }: { dok: Dokumen }) {
  const njt = dok.merek.find((m) => m.peran === "NJT");
  const hitungFpm = (m: MerekRow): number | null => {
    if (m.peran === "NJT") return 0;
    if (!njt || njt.harga <= 0 || m.harga <= 0) return null;
    return Math.round(((njt.harga - m.harga) / m.harga) * 100);
  };

  return (
    <div
      className="page-break"
      style={{
        ...serif,
        color: "#000",
        fontSize: "11px",
        pageBreakBefore: "always",
        breakBefore: "page",
      }}
    >
      <Kop dok={dok} />
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "12px",
        }}
      >
        (Lembar Kedua)
      </div>
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "12px",
          textDecoration: "underline",
          marginTop: "2px",
          marginBottom: "10px",
        }}
      >
        Perhitungan Besaran Penyesuaian Merek
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
        <tbody>
          <tr>
            <td style={{ ...noBorder, width: "45%" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  border: "1px solid #000",
                  width: "80%",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: "6px 10px", textAlign: "center", fontSize: "13px" }}>
                      <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                        Rumusan
                      </div>
                      <div>
                        Fpm =
                        <span
                          style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            marginLeft: "6px",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ borderBottom: "1px solid #000", padding: "0 6px" }}>
                            NJT - NJP
                          </div>
                          <div style={{ padding: "0 6px" }}>NJP</div>
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
            <td style={noBorder}>
              <table style={{ borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={noBorder}>Fpm</td>
                    <td style={noBorder}>: Faktor Penyesuaian Merek</td>
                  </tr>
                  <tr>
                    <td style={noBorder}>NJT</td>
                    <td style={noBorder}>
                      : Harga baru objek yang akan ditentukan nilai taksirannya
                    </td>
                  </tr>
                  <tr>
                    <td style={noBorder}>NJP</td>
                    <td style={noBorder}>: Harga baru objek pembanding</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...thBorder, width: "5%" }}>No.</th>
            <th style={{ ...thBorder, width: "18%" }}>Merek</th>
            <th style={{ ...thBorder, width: "20%" }}>
              Harga Baru/Harga Jual Saat Ini
            </th>
            <th style={{ ...thBorder, width: "17%" }}>
              Besaran Penyesuaian (Fpm)
            </th>
            <th style={thBorder}>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          {dok.merek.map((m, i) => {
            const fpm = hitungFpm(m);
            const keterangan =
              m.keterangan ||
              (m.peran === "NJT"
                ? KETERANGAN_MEREK.njr
                : KETERANGAN_MEREK.pembanding);
            return (
              <tr key={m.id}>
                <td style={{ ...tdBorder, textAlign: "center" }}>{i + 1}.</td>
                <td style={tdBorder}>{m.merek}</td>
                <td style={{ ...tdBorder, textAlign: "right" }}>
                  {formatRp(m.harga)}
                </td>
                <td style={{ ...tdBorder, textAlign: "center" }}>
                  {m.peran}
                  {fpm !== null ? ` (${fpm}%)` : ""}
                </td>
                <td style={tdBorder}>{keterangan}</td>
              </tr>
            );
          })}
          {Array.from({ length: Math.max(0, 3 - dok.merek.length) }).map(
            (_, i) => (
              <tr key={`kosong-merek-${i}`}>
                <td style={{ ...tdBorder, textAlign: "center" }}>
                  {dok.merek.length + i + 1}.
                </td>
                <td style={tdBorder}>&nbsp;</td>
                <td style={tdBorder}>&nbsp;</td>
                <td style={tdBorder}>&nbsp;</td>
                <td style={tdBorder}>&nbsp;</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export function KertasKerja({ dok }: { dok: Dokumen }) {
  return (
    <div
      id="kertas-kerja"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "12mm",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <LembarPertama dok={dok} />
      {dok.merek.length > 0 ? <LembarKedua dok={dok} /> : null}
    </div>
  );
}
