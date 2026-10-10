import { describe, expect, it } from "vitest";
import { deteksiNamaCookieSesi } from "@/lib/sesi";

describe("deteksiNamaCookieSesi", () => {
  it("memilih cookie __Secure- di produksi https (Vercel)", () => {
    expect(
      deteksiNamaCookieSesi(
        "__Secure-authjs.session-token=abc123; authjs.csrf-token=xyz"
      )
    ).toBe("__Secure-authjs.session-token");
  });

  it("memilih cookie non-secure untuk http://localhost", () => {
    expect(deteksiNamaCookieSesi("authjs.session-token=abc123")).toBe(
      "authjs.session-token"
    );
  });

  it("mendukung cookie terpotong (chunked)", () => {
    expect(
      deteksiNamaCookieSesi(
        "__Secure-authjs.session-token.0=abc; __Secure-authjs.session-token.1=def"
      )
    ).toBe("__Secure-authjs.session-token");
  });

  it("default non-secure saat header tidak ada", () => {
    expect(deteksiNamaCookieSesi(null)).toBe("authjs.session-token");
    expect(deteksiNamaCookieSesi(undefined)).toBe("authjs.session-token");
    expect(deteksiNamaCookieSesi("")).toBe("authjs.session-token");
  });
});
