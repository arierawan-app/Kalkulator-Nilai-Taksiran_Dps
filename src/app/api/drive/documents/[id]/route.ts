import { NextResponse, type NextRequest } from "next/server";
import { dapatkanAccessToken, klienDrive } from "@/lib/drive-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const accessToken = await dapatkanAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const drive = klienDrive(accessToken);
    const res = await drive.files.get({ fileId: id, alt: "media" });
    const data =
      typeof res.data === "string" ? JSON.parse(res.data) : res.data;
    return NextResponse.json({ fileId: id, dokumen: data });
  } catch (error) {
    console.error("Gagal membuka dokumen", error);
    return NextResponse.json({ error: "DRIVE_ERROR" }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const accessToken = await dapatkanAccessToken(req);
  if (!accessToken) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const drive = klienDrive(accessToken);
    await drive.files.delete({ fileId: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Gagal menghapus dokumen", error);
    return NextResponse.json({ error: "DRIVE_ERROR" }, { status: 502 });
  }
}
