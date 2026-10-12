import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { klienSupabase } from "./supabase";
import { normalisasiKodeSatker } from "./satker";

type BarisLogin = {
  kode_satker: string;
  nama_satker: string;
  nama_kementerian: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Kode Satker",
      credentials: {
        kode: { label: "Kode Satker", type: "text" },
        sandi: { label: "Kata Sandi", type: "password" },
      },
      authorize: async (credentials) => {
        const kode =
          typeof credentials?.kode === "string"
            ? normalisasiKodeSatker(credentials.kode)
            : "";
        const sandi =
          typeof credentials?.sandi === "string" ? credentials.sandi : "";
        if (!kode || !sandi) return null;

        const { data, error } = await klienSupabase().rpc("knt_login", {
          p_kode: kode,
          p_sandi: sandi,
        });
        if (error || !data || data.length === 0) return null;

        const baris = data[0] as BarisLogin;
        return {
          id: baris.kode_satker,
          name: baris.nama_satker,
          kodeSatker: baris.kode_satker,
          namaSatker: baris.nama_satker,
          namaKementerian: baris.nama_kementerian,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.kodeSatker = user.kodeSatker;
        token.namaSatker = user.namaSatker;
        token.namaKementerian = user.namaKementerian;
      }
      return token;
    },
    session({ session, token }) {
      session.user.kodeSatker = token.kodeSatker ?? "";
      session.user.namaSatker = token.namaSatker ?? "";
      session.user.namaKementerian = token.namaKementerian ?? "";
      return session;
    },
  },
});
