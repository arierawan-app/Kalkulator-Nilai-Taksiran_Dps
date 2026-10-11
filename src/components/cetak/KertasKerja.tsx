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

const tdBorder: CSSProperties = {
  border: "1px solid #000",
  padding: "4px 5px",
  verticalAlign: "top",
  overflowWrap: "break-word",
};
const thBorder: CSSProperties = {
  ...tdBorder,
  textAlign: "center",
  fontWeight: "bold",
  verticalAlign: "middle",
};
const noBorder: CSSProperties = { padding: "2px 3px", verticalAlign: "top" };
const tabel: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
};
const barisAman: CSSProperties = { breakInside: "avoid" };
const judulSeksi: CSSProperties = {
  fontWeight: "bold",
  marginTop: "10px",
  marginBottom: "4px",
};

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
    <table style={{ ...tabel, marginBottom: "10px" }}>
      <colgroup>
        <col style={{ width: "16mm" }} />
        <col />
        <col style={{ width: "16mm" }} />
      </colgroup>
      <tbody>
        <tr>
          <td style={noBorder}>
            {dok.satker.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dok.satker.logoDataUrl}
                alt="Logo"
                style={{ width: "60px", height: "60px", objectFit: "contain" }}
              />
            ) : null}
          </td>
          <td style={{ ...noBorder, textAlign: "center" }}>
            <div style={{ fontWeight: "bold" }}>
              KERTAS KERJA ANALISIS PENETUAN NILAI TAKSIRAN BMN
            </div>
            <div style={{ fontWeight: "bold" }}>
              {dok.satker.namaKementerian || "KEMENTERIAN/LEMBAGA"}
            </div>
            <div style={{ fontWeight: "bold" }}>{tujuan}</div>
          </td>
          <td style={noBorder} />
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

  return (
    <div style={{ color: "#000" }}>
      <Kop dok={dok} />

      <table style={{ ...tabel, marginBottom: "8px" }}>
        <colgroup>
          <col style={{ width: "42mm" }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td style={noBorder}>Nomor Kertas Kerja</td>
            <td style={noBorder}>: {satker.nomorKertasKerja}</td>
          </tr>
        </tbody>
      </table>

      <div style={judulSeksi}>1. Identifikasi</div>
      <table style={tabel}>
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "28%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "24%" }} />
        </colgroup>
        <tbody>
          <tr style={barisAman}>
            <td style={noBorder}>a.</td>
            <td style={noBorder}>Nama Objek</td>
            <td style={noBorder}>: {objek.namaObjek}</td>
            <td style={noBorder}>NUP</td>
            <td style={noBorder}>: {objek.nup || "-"}</td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder}>b.</td>
            <td style={noBorder}>Lokasi Objek</td>
            <td style={noBorder}>: {objek.lokasiObjek}</td>
            <td style={noBorder}>Kategori Lokasi</td>
            <td style={noBorder}>: {objek.kategoriLokasi}</td>
          </tr>
          <tr style={barisAman}>
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
          <tr style={barisAman}>
            <td style={noBorder}>d.</td>
            <td style={noBorder}>Merek Kendaraan</td>
            <td style={noBorder} colSpan={3}>
              : {objek.merek}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder}>e.</td>
            <td style={noBorder}>Tipe Kendaraan</td>
            <td style={noBorder} colSpan={3}>
              : {objek.tipe}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder}>f.</td>
            <td style={noBorder} colSpan={4}>
              Identitas Kendaraan :
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder} />
            <td style={noBorder}>(i) Nomor Polisi</td>
            <td style={noBorder} colSpan={3}>
              : {objek.nomorPolisi || "-"}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder} />
            <td style={noBorder}>(ii) Dokumen Kepemilikan</td>
            <td style={noBorder} colSpan={3}>
              : <Kotak aktif={objek.dokumen === "BPKB"} /> BPKB{" "}
              <Kotak aktif={objek.dokumen === "STNK"} /> STNK{" "}
              <Kotak aktif={objek.dokumen === "Lainnya"} /> Lainnya ...{" "}
              <Kotak aktif={objek.dokumen === "Tidak ada"} /> Tidak ada
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder} />
            <td style={noBorder}>(iii) Pemilik Dokumen</td>
            <td style={noBorder} colSpan={3}>
              : {objek.pemilikDokumen || "-"}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder} />
            <td style={noBorder}>(iv) Masa Berlaku</td>
            <td style={noBorder} colSpan={3}>
              : <Kotak aktif={objek.masaBerlaku === "Masih berlaku"} /> Masih
              Berlaku{" "}
              <Kotak aktif={objek.masaBerlaku === "Habis masa berlaku"} /> Habis
              Masa Berlaku
              {objek.keteranganMasaBerlaku
                ? ` - Keterangan: ${objek.keteranganMasaBerlaku}`
                : ""}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder} />
            <td style={noBorder}>(v) Penggunaan Kendaraan</td>
            <td style={noBorder} colSpan={3}>
              : {objek.penggunaan || "-"}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder} />
            <td style={noBorder}>(vi) Keterangan Lain</td>
            <td style={noBorder} colSpan={3}>
              : {objek.keteranganLain || "-"}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={judulSeksi}>2. Fisik Kendaraan</div>
      <table style={tabel}>
        <colgroup>
          <col style={{ width: "4%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "28%" }} />
        </colgroup>
        <tbody>
          <tr style={barisAman}>
            <td style={noBorder}>a.</td>
            <td style={noBorder}>Warna</td>
            <td style={noBorder}>: {objek.warna}</td>
            <td style={noBorder} colSpan={2}>
              d. Kondisi Kendaraan :
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder}>b.</td>
            <td style={noBorder}>Tahun Pembuatan</td>
            <td style={noBorder}>: {objek.tahunPembuatan}</td>
            <td style={noBorder} colSpan={2}>
              <Kotak aktif={objek.tingkatKerusakan === "di_atas_90"} />{" "}
              {labelTingkat.di_atas_90}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder}>c.</td>
            <td style={noBorder}>Bahan Bakar</td>
            <td style={noBorder}>: {objek.bahanBakar}</td>
            <td style={noBorder} colSpan={2}>
              <Kotak aktif={objek.tingkatKerusakan === "80_sampai_90"} />{" "}
              {labelTingkat["80_sampai_90"]}
            </td>
          </tr>
          <tr style={barisAman}>
            <td style={noBorder} />
            <td style={noBorder} />
            <td style={noBorder} />
            <td style={noBorder} colSpan={2}>
              <Kotak aktif={objek.tingkatKerusakan === "sampai_80"} />{" "}
              {labelTingkat.sampai_80}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ ...judulSeksi, textAlign: "center" }}>
        DATA HASIL LELANG
      </div>
      <table style={tabel}>
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "13%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={thBorder}>No.</th>
            <th style={thBorder}>Data Hasil Lelang</th>
            <th style={thBorder}>Kode Lelang</th>
            <th style={thBorder}>Tipe</th>
            <th style={thBorder}>Harga Lelang</th>
            <th style={thBorder}>Waktu Lelang</th>
            <th style={thBorder} colSpan={2}>
              Kategori Lokasi Lelang
            </th>
            <th style={thBorder}>Tahun Pembuatan</th>
          </tr>
        </thead>
        <tbody>
          {dok.lelang.map((row, i) => {
            const lokasi = row.namaKPKNL.replace(/^KPKNL\s+/i, "");
            return (
              <tr key={row.id} style={barisAman}>
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
                <td style={tdBorder}>{lokasi || "-"}</td>
                <td style={{ ...tdBorder, textAlign: "center" }}>
                  {row.kategoriLokasi}
                </td>
                <td style={{ ...tdBorder, textAlign: "center" }}>
                  {row.tahunPembuatan}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ ...judulSeksi, textAlign: "center" }}>PENYESUAIAN</div>
      <table style={tabel}>
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "25%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={thBorder}>No.</th>
            <th style={thBorder}>Data Hasil Lelang</th>
            <th style={thBorder}>Tipe</th>
            <th style={thBorder}>Merek</th>
            <th style={thBorder}>Waktu</th>
            <th style={thBorder}>Lokasi</th>
            <th style={thBorder}>Tahun Pembuatan</th>
            <th style={thBorder}>Total</th>
            <th style={thBorder}>Nilai Taksiran</th>
          </tr>
        </thead>
        <tbody>
          {rekap.baris.map((b, i) => (
            <tr key={b.row.id} style={barisAman}>
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
          <tr style={barisAman}>
            <td
              style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}
              colSpan={8}
            >
              Nilai Taksiran
            </td>
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              {formatRp(rekap.total)}
            </td>
          </tr>
          <tr style={barisAman}>
            <td
              style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}
              colSpan={8}
            >
              Rata-rata Nilai Taksiran
            </td>
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              {formatRp(rekap.rataRata)}
            </td>
          </tr>
          <tr style={barisAman}>
            <td
              style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}
              colSpan={8}
            >
              Taksiran Nilai Limit Lelang (x{" "}
              {faktor.toString().replace(".", ",")})
            </td>
            <td style={{ ...tdBorder, textAlign: "right", fontWeight: "bold" }}>
              {formatRp(rekap.limit)}
            </td>
          </tr>
          <tr style={barisAman}>
            <td
              style={{
                ...tdBorder,
                textAlign: "right",
                fontWeight: "bold",
                backgroundColor: "#eeeeee",
              }}
              colSpan={8}
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

      <div
        className="blok-ttd"
        style={{
          marginTop: "20px",
          paddingBottom: "12mm",
          breakInside: "avoid",
          pageBreakInside: "avoid",
        }}
      >
        <table style={tabel}>
          <colgroup>
            <col style={{ width: "55%" }} />
            <col />
          </colgroup>
          <tbody>
            <tr style={barisAman}>
              <td style={noBorder} />
              <td style={noBorder}>
                <div>
                  {panitia.kota}
                  {panitia.tanggal
                    ? `, ${formatTanggalIndonesia(panitia.tanggal)}`
                    : ", ........................"}
                </div>
                <div style={{ marginTop: "3px" }}>Panitia Penaksir</div>
              </td>
            </tr>
          </tbody>
        </table>
        <table style={{ ...tabel, marginTop: "8px" }}>
          <tbody>
            <tr style={barisAman}>
              {panitia.anggota.map((a) => (
                <td
                  key={a.id}
                  style={{
                    ...noBorder,
                    textAlign: "center",
                    width: `${100 / Math.max(1, panitia.anggota.length)}%`,
                  }}
                >
                  <div style={{ height: "52px" }} />
                  <div>({a.jabatan})</div>
                  {a.nama ? <div>{a.nama}</div> : null}
                  <div style={{ minHeight: "18px", marginTop: "3px" }}>
                    {a.nip ? `NIP. ${a.nip}` : ""}
                  </div>
                  <div style={{ height: "8px" }} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
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
        color: "#000",
        pageBreakBefore: "always",
        breakBefore: "page",
      }}
    >
      <Kop dok={dok} />
      <div style={{ textAlign: "center", fontWeight: "bold" }}>
        (Lembar Kedua)
      </div>
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          textDecoration: "underline",
          marginTop: "2px",
          marginBottom: "10px",
        }}
      >
        Perhitungan Besaran Penyesuaian Merek
      </div>

      <table style={{ ...tabel, marginBottom: "10px" }}>
        <colgroup>
          <col style={{ width: "45%" }} />
          <col />
        </colgroup>
        <tbody>
          <tr style={barisAman}>
            <td style={noBorder}>
              <table
                style={{
                  borderCollapse: "collapse",
                  border: "1px solid #000",
                  width: "80%",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
                      <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                        Rumusan
                      </div>
                      <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
                        <tbody>
                          <tr>
                            <td style={{ verticalAlign: "middle", paddingRight: "6px" }}>
                              Fpm =
                            </td>
                            <td style={{ verticalAlign: "middle" }}>
                              <table style={{ margin: "0 auto", borderCollapse: "collapse" }}>
                                <tbody>
                                  <tr>
                                    <td
                                      style={{
                                        borderBottom: "1px solid #000",
                                        padding: "0 6px 2px",
                                        textAlign: "center",
                                      }}
                                    >
                                      NJT - NJP
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      style={{
                                        padding: "2px 6px 0",
                                        textAlign: "center",
                                      }}
                                    >
                                      NJP
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
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

      <table style={tabel}>
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "38%" }} />
        </colgroup>
        <thead>
          <tr>
            <th style={thBorder}>No.</th>
            <th style={thBorder}>Merek</th>
            <th style={thBorder}>Harga Baru/Harga Jual Saat Ini</th>
            <th style={thBorder}>Besaran Penyesuaian (Fpm)</th>
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
              <tr key={m.id} style={barisAman}>
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
        width: "186mm",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "10pt",
        lineHeight: 1.3,
        color: "#000",
      }}
    >
      <LembarPertama dok={dok} />
      {dok.merek.length > 0 ? <LembarKedua dok={dok} /> : null}
    </div>
  );
}
