import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        logger.log("Testing Prisma connection...");
        const userCount = await prisma.user.count();
        logger.log("User count:", userCount);
        return NextResponse.json({ success: true, userCount });
    } catch (error) {
        logger.error("Prisma test error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Database connection failed"
        }, { status: 500 });
    }
}
