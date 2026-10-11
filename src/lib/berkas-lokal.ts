"use client";

export type JenisBerkas = {
  deskripsi: string;
  mime: string;
  ekstensi: string[];
};

export const BERKAS_JSON: JenisBerkas = {
  deskripsi: "Data isian kertas kerja (JSON)",
  mime: "application/json",
  ekstensi: [".json"],
};

export const BERKAS_PDF: JenisBerkas = {
  deskripsi: "Dokumen PDF",
  mime: "application/pdf",
  ekstensi: [".pdf"],
};

type PenulisBerkas = {
  write: (data: Blob) => Promise<void>;
  close: () => Promise<void>;
};

type HandleBerkas = {
  name: string;
  createWritable: () => Promise<PenulisBerkas>;
  getFile: () => Promise<File>;
};

type OpsiPemilih = {
  suggestedName?: string;
  multiple?: boolean;
  types?: { description?: string; accept: Record<string, string[]> }[];
};

type JendelaPemilih = {
  showSaveFilePicker?: (opsi: OpsiPemilih) => Promise<HandleBerkas>;
  showOpenFilePicker?: (opsi: OpsiPemilih) => Promise<HandleBerkas[]>;
};

export type HasilSimpan = {
  nama: string;
  metode: "pilih-lokasi" | "unduhan";
};

function ambilJendela(): JendelaPemilih | null {
  if (typeof window === "undefined") return null;
  return window as unknown as JendelaPemilih;
}

function dibatalkan(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function tipeBerkas(jenis: JenisBerkas) {
  return [{ description: jenis.deskripsi, accept: { [jenis.mime]: jenis.ekstensi } }];
}

function unduhLewatTautan(blob: Blob, nama: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function pilihLewatInput(jenis: JenisBerkas): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = [jenis.mime, ...jenis.ekstensi].join(",");
    input.style.display = "none";
    input.addEventListener("change", () => {
      const file = input.files?.[0] ?? null;
      input.remove();
      resolve(file);
    });
    input.addEventListener("cancel", () => {
      input.remove();
      resolve(null);
    });
    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Menyimpan blob ke perangkat pengguna. Pada browser yang mendukung File
 * System Access API, pengguna dipandu pop-up untuk memilih lokasi simpan.
 * Pada browser lain (mis. Safari/Firefox), berkas diunduh ke folder unduhan.
 * Mengembalikan null bila pengguna membatalkan dialog.
 */
export async function simpanBlobLokal(
  blob: Blob,
  namaDisarankan: string,
  jenis: JenisBerkas
): Promise<HasilSimpan | null> {
  const jendela = ambilJendela();
  if (jendela?.showSaveFilePicker) {
    try {
      const handle = await jendela.showSaveFilePicker({
        suggestedName: namaDisarankan,
        types: tipeBerkas(jenis),
      });
      const penulis = await handle.createWritable();
      await penulis.write(blob);
      await penulis.close();
      return { nama: handle.name, metode: "pilih-lokasi" };
    } catch (error) {
      if (dibatalkan(error)) return null;
      throw error;
    }
  }
  unduhLewatTautan(blob, namaDisarankan);
  return { nama: namaDisarankan, metode: "unduhan" };
}

/**
 * Membuka berkas dari perangkat pengguna. Pada browser yang mendukung File
 * System Access API, pengguna dipandu pop-up pemilih berkas. Pada browser
 * lain, pemilihan dilakukan lewat input berkas bawaan. Mengembalikan null
 * bila pengguna membatalkan pilihan.
 */
export async function bukaBerkasLokal(
  jenis: JenisBerkas
): Promise<File | null> {
  const jendela = ambilJendela();
  if (jendela?.showOpenFilePicker) {
    try {
      const [handle] = await jendela.showOpenFilePicker({
        multiple: false,
        types: tipeBerkas(jenis),
      });
      return await handle.getFile();
    } catch (error) {
      if (dibatalkan(error)) return null;
      throw error;
    }
  }
  return pilihLewatInput(jenis);
}
