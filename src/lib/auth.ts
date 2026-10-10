import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const GOOGLE_SCOPE =
  "openid email profile https://www.googleapis.com/auth/drive.file";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      authorization: {
        params: {
          scope: GOOGLE_SCOPE,
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          error: undefined,
        };
      }
      if (
        token.access_token &&
        token.expires_at &&
        Date.now() < token.expires_at * 1000
      ) {
        return token;
      }
      if (!token.refresh_token) {
        return { ...token, error: "RefreshTokenError" as const };
      }
      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.AUTH_GOOGLE_ID!,
            client_secret: process.env.AUTH_GOOGLE_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token,
          }),
        });
        const tokens = await response.json();
        if (!response.ok) throw tokens;
        return {
          ...token,
          access_token: tokens.access_token as string,
          expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
          refresh_token: (tokens.refresh_token as string | undefined) ?? token.refresh_token,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshTokenError" as const };
      }
    },
    async session({ session, token }) {
      session.error = token.error;
      return session;
    },
  },
});
