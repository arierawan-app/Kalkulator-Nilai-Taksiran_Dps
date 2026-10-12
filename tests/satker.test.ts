import { describe, expect, it } from "vitest";
import {
  normalisasiKodeSatker,
  validasiLogo,
  validasiSandiBaru,
} from "@/lib/satker";

describe("normalisasiKodeSatker", () => {
  it("memangkas spasi dan menyeragamkan huruf besar", () => {
    expect(normalisasiKodeSatker("  004012200579001000kd ")).toBe(
      "004012200579001000KD"
    );
  });
});

describe("validasiSandiBaru", () => {
  it("menolak kata sandi kurang dari 8 karakter", () => {
    expect(validasiSandiBaru("Knl.14")).not.toBeNull();
  });

  it("menolak kata sandi tanpa kombinasi huruf dan angka", () => {
    expect(validasiSandiBaru("abcdefgh")).not.toBeNull();
    expect(validasiSandiBaru("12345678")).not.toBeNull();
  });

  it("menerima kata sandi minimal 8 karakter berisi huruf dan angka", () => {
    expect(validasiSandiBaru("KNL.1401")).toBeNull();
    expect(validasiSandiBaru("sandiBaru2026")).toBeNull();
  });
});

describe("validasiLogo", () => {
  it("menolak tipe berkas selain PNG/JPEG", () => {
    expect(validasiLogo({ type: "image/gif", size: 1000 })).not.toBeNull();
  });

  it("menolak berkas lebih dari 2 MB", () => {
    expect(
      validasiLogo({ type: "image/png", size: 2 * 1024 * 1024 + 1 })
    ).not.toBeNull();
  });

  it("menerima berkas PNG/JPEG maksimal 2 MB", () => {
    expect(validasiLogo({ type: "image/png", size: 1024 })).toBeNull();
    expect(validasiLogo({ type: "image/jpeg", size: 2 * 1024 * 1024 })).toBeNull();
  });
});
