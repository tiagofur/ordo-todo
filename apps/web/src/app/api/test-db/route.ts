import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        console.log("Testing Prisma connection...");
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);
        return NextResponse.json({ success: true, userCount });
    } catch (error) {
        console.error("Prisma test error:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
