import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
    try {
        logger.log("Testing Prisma connection...");
        const userCount = await prisma.user.count();
        logger.log("User count:", userCount);
        return NextResponse.json({ success: true, userCount });
    } catch (error) {
        logger.error("Prisma test error:", error);
        logger.error("Error details:", error instanceof Error ? error.message : String(error));
        logger.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
