import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { redis } from "./redis";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email y contraseña son requeridos");
                }

                // Use explicit select to avoid errors with schema mismatches
                // and improve query performance
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        hashedPassword: true,
                    },
                });

                if (!user || !user.hashedPassword) {
                    throw new Error("Email o contraseña incorrectos");
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isPasswordValid) {
                    throw new Error("Email o contraseña incorrectos");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.user = {
                    id: user.id,
                    name: user.name || undefined,
                    email: user.email || undefined,
                };
            }

            // Store session in Redis if available (for additional caching)
            if (redis && token.sub) {
                try {
                    await redis.setex(`session:${token.sub}`, 86400, JSON.stringify({
                        user: token.user,
                        expires: token.exp,
                    })); // 24 hours
                } catch (error) {
                    console.error("Failed to cache session in Redis:", error);
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user;
            }

            // Try to get additional session data from Redis
            if (redis && token.sub) {
                try {
                    const cachedSession = await redis.get(`session:${token.sub}`);
                    if (cachedSession && typeof cachedSession === 'object' && 'user' in cachedSession) {
                        // Merge cached data if needed
                        session.user = { ...session.user, ...(cachedSession as any).user };
                    }
                } catch (error) {
                    console.error("Failed to get session from Redis:", error);
                }
            }

            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};