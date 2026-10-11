"use client";

type OpsiPdf = {
  margin?: [number, number, number, number];
  filename?: string;
  image?: { type?: "jpeg" | "png" | "webp"; quality?: number };
  html2canvas?: object;
  jsPDF?: {
    unit?: string;
    format?: string | [number, number];
    orientation?: "portrait" | "landscape";
  };
  pagebreak?: {
    mode?: string[];
    before?: string;
    after?: string;
    avoid?: string[];
  };
};

export async function buatBlobPdf(
  element: HTMLElement,
  namaFile: string
): Promise<Blob> {
  const html2pdf = (await import("html2pdf.js")).default;
  const opsi: OpsiPdf = {
    margin: [12, 12, 12, 12],
    filename: namaFile,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: {
      mode: ["css", "legacy"],
      before: ".page-break",
      avoid: ["tr"],
    },
  };
  return html2pdf().set(opsi).from(element).outputPdf("blob");
}

export function unduhBlob(blob: Blob, namaFile: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
