import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    userId: string;
    access_token: string;
    refresh_token: string;
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    access_token: string;
    refresh_token: string;
  }
}