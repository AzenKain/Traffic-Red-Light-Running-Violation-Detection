import { Backend_URL } from "@/lib/Constants";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import "core-js/stable/atob";


class JwtPayload {
    Id: string;
    Email: string
    iat: number;
    exp: number;

    constructor(id: string, email: string, iat: number, exp: number) {
        this.Id = id;
        this.Email = email;
        this.iat = iat;
        this.exp = exp;
    }
}


async function refreshToken(token: JWT): Promise<JWT> {
    const res = await fetch(Backend_URL + "/auth/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token.refresh_token}`
        },
    });

    if (res.status != 201) {
        console.log(res.status)
        throw new Error("Failed to refresh token");
    }

    const response = await res.json();

    return {
        ...token,
        access_token: response.access_token,
        refresh_token: response.refresh_token || token.refresh_token,
    };
}

const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;
                const { email, password } = credentials;
                const res = await fetch(Backend_URL + "/auth/signin", {
                    method: "POST",
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (res.status == 403) {
                    return null;
                }

                const token = await res.json();

                return token;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) return { ...token, ...user };
            const decoded = jwtDecode<JwtPayload>(token.access_token);

            const expirationBuffer = 10 * 60 * 1000;
            if (new Date().getTime() < decoded.exp * 1000 - expirationBuffer) {
                return token;
            }

            return await refreshToken(token);
        },

        async session({ token, session }) {
            const decoded = jwtDecode<JwtPayload>(token.refresh_token);
            session.userId = decoded.Id
            session.access_token = token.access_token;
            session.refresh_token = token.refresh_token;
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    secret: process.env.NEXTAUTH_SECRET as string,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };