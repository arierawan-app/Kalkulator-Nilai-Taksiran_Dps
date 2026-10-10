import { NextResponse, type NextRequest } from "next/server";
import {
  ambilAtauBuatFolder,
  dapatkanAccessToken,
  klienDrive,
} from "@/lib/drive-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const accessToken = await dapatkanAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const drive = klienDrive(accessToken);
    const folderId = await ambilAtauBuatFolder(drive);
    const q = [
      `'${folderId}' in parents`,
      "mimeType = 'application/json'",
      "trashed = false",
    ].join(" and ");
    const res = await drive.files.list({
      q,
      fields: "files(id, name, modifiedTime, size)",
      orderBy: "modifiedTime desc",
      pageSize: 50,
    });
    return NextResponse.json({ folderId, files: res.data.files ?? [] });
  } catch (error) {
    console.error("Gagal memuat daftar dokumen", error);
    return NextResponse.json({ error: "DRIVE_ERROR" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const accessToken = await dapatkanAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      fileId?: string;
      namaFile?: string;
      dokumen?: unknown;
    };
    if (!body.dokumen) {
      return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
    }
    const drive = klienDrive(accessToken);
    const content = JSON.stringify(body.dokumen, null, 2);
    if (body.fileId) {
      await drive.files.update({
        fileId: body.fileId,
        media: { mimeType: "application/json", body: content },
      });
      return NextResponse.json({ fileId: body.fileId });
    }
    const folderId = await ambilAtauBuatFolder(drive);
    const res = await drive.files.create({
      requestBody: {
        name: body.namaFile || "dokumen-taksiran.json",
        parents: [folderId],
        mimeType: "application/json",
      },
      media: { mimeType: "application/json", body: content },
      fields: "id",
    });
    return NextResponse.json({ fileId: res.data.id });
  } catch (error) {
    console.error("Gagal menyimpan dokumen", error);
    return NextResponse.json({ error: "DRIVE_ERROR" }, { status: 502 });
  }
}
