import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usernameValidationSchema } from "@ordo-todo/core";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = usernameValidationSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { username } = result.data;

        // Check if username is already taken
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    available: false,
                    message: "Username is already taken",
                    suggestions: generateUsernameSuggestions(username)
                },
                { status: 200 }
            );
        }

        return NextResponse.json(
            {
                available: true,
                message: "Username is available"
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error checking username:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Helper function to generate username suggestions
function generateUsernameSuggestions(baseUsername: string): string[] {
    const base = baseUsername.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    const suggestions = [];
    const randomNumbers = [123, 456, 789, 2024, 2025, 99, 1, 7];
    const suffixes = ['', '_', '-', '___', '__', 'dev', 'app', 'user', 'pro', 'official'];

    for (let i = 0; i < 5; i++) {
        const randomNum = randomNumbers[Math.floor(Math.random() * randomNumbers.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        suggestions.push(`${base}${suffix}${randomNum}`);
    }

    return [...new Set(suggestions)].slice(0, 5);
}