import { describe, expect, it } from "vitest";
import { Packer } from "docx";
import { buatDokumenWord } from "@/lib/word";
import { dokumenBaru, merekRowKosong } from "@/lib/dokumen";

describe("ekspor kertas kerja ke Word", () => {
  it("menghasilkan DOCX untuk lembar pertama", async () => {
    const bytes = await Packer.toBuffer(buatDokumenWord(dokumenBaru()));

    expect(bytes.subarray(0, 2).toString("utf8")).toBe("PK");
    expect(bytes.length).toBeGreaterThan(1000);
  });

  it("menyertakan lembar penyesuaian merek saat datanya tersedia", async () => {
    const dokumen = dokumenBaru();
    const njt = merekRowKosong("NJT");
    const njp = merekRowKosong("NJP");
    njt.merek = "Honda";
    njt.harga = 10_000_000;
    njp.merek = "Yamaha";
    njp.harga = 8_000_000;
    dokumen.merek = [njt, njp];

    const bytes = await Packer.toBuffer(buatDokumenWord(dokumen));

    expect(bytes.subarray(0, 2).toString("utf8")).toBe("PK");
    expect(bytes.length).toBeGreaterThan(1000);
  });
});
