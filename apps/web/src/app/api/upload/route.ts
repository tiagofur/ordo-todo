import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { verify } from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        // Check authentication - support both NextAuth session and JWT token
        let userId: string | undefined;

        // Try NextAuth session first
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            userId = session.user.id;
        } else {
            // Try JWT token from Authorization header
            const authHeader = request.headers.get("Authorization");
            if (authHeader?.startsWith("Bearer ")) {
                const token = authHeader.substring(7);
                const secret = process.env.JWT_SECRET;

                if (secret) {
                    try {
                        const decoded = verify(token, secret) as { sub?: string; userId?: string };
                        userId = decoded.sub || decoded.userId;
                    } catch (error) {
                        console.error("JWT verification failed:", error);
                    }
                } else {
                    console.warn("JWT_SECRET not configured - JWT authentication disabled");
                }
            }
        }

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const taskId = formData.get("taskId") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        if (!taskId) {
            return NextResponse.json(
                { error: "No taskId provided" },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 10MB" },
                { status: 400 }
            );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads", taskId);
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}-${sanitizedFilename}`;
        const filepath = join(uploadsDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Generate public URL
        const publicUrl = `/uploads/${taskId}/${filename}`;

        // Return standardized response matching frontend expectations
        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: file.name,
            mimeType: file.type,
            filesize: file.size,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        );
    }
}
