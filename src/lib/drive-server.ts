import { getToken } from "next-auth/jwt";
import { google } from "googleapis";
import type { drive_v3 } from "googleapis";
import type { NextRequest } from "next/server";
import { deteksiNamaCookieSesi } from "./sesi";

export const NAMA_FOLDER_DRIVE = "Kalkulator Nilai Taksiran";

type TokenGoogle = {
  access_token?: string;
  expires_at?: number;
  refresh_token?: string;
};

async function segarkanToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });
    const data = await response.json();
    if (!response.ok) return null;
    return (data.access_token as string) ?? null;
  } catch {
    return null;
  }
}

export async function dapatkanAccessToken(
  req: NextRequest
): Promise<string | null> {
  const token = (await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: deteksiNamaCookieSesi(req.headers.get("cookie")),
  })) as TokenGoogle | null;
  if (!token) return null;
  const masihValid =
    token.access_token &&
    token.expires_at &&
    Date.now() < (token.expires_at - 60) * 1000;
  if (masihValid) return token.access_token!;
  if (!token.refresh_token) return null;
  return segarkanToken(token.refresh_token);
}

export function klienDrive(accessToken: string): drive_v3.Drive {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function ambilAtauBuatFolder(drive: drive_v3.Drive): Promise<string> {
  const q = [
    "mimeType = 'application/vnd.google-apps.folder'",
    `name = '${NAMA_FOLDER_DRIVE}'`,
    "trashed = false",
  ].join(" and ");
  const list = await drive.files.list({
    q,
    fields: "files(id, name)",
    spaces: "drive",
  });
  const ada = list.data.files?.[0]?.id;
  if (ada) return ada;
  const dibuat = await drive.files.create({
    requestBody: {
      name: NAMA_FOLDER_DRIVE,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });
  return dibuat.data.id!;
}
