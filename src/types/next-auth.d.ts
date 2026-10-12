import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    kodeSatker: string;
    namaSatker: string;
    namaKementerian: string;
  }

  interface Session {
    user: {
      kodeSatker: string;
      namaSatker: string;
      namaKementerian: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    kodeSatker?: string;
    namaSatker?: string;
    namaKementerian?: string;
  }
}
