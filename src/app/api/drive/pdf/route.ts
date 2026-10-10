import { NextResponse, type NextRequest } from "next/server";
import {
  ambilAtauBuatFolder,
  dapatkanAccessToken,
  klienDrive,
} from "@/lib/drive-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const accessToken = await dapatkanAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    const nama = String(form.get("nama") || "kertas-kerja-nilai-taksiran.pdf");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const drive = klienDrive(accessToken);
    const folderId = await ambilAtauBuatFolder(drive);
    const res = await drive.files.create({
      requestBody: {
        name: nama,
        parents: [folderId],
        mimeType: "application/pdf",
      },
      media: { mimeType: "application/pdf", body: buffer },
      fields: "id, webViewLink",
    });
    return NextResponse.json({
      fileId: res.data.id,
      webViewLink: res.data.webViewLink,
    });
  } catch (error) {
    console.error("Gagal mengunggah PDF", error);
    return NextResponse.json({ error: "DRIVE_ERROR" }, { status: 502 });
  }
}
