import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerUserSchema } from "@ordo-todo/core";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = registerUserSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { name, email, password } = result.data;

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "El email ya está registrado" },
                { status: 400 }
            );
        }

        // Hash de la contraseña
        const hashedPassword = await hash(password, 12);

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
            },
        });

        return NextResponse.json(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error en signup:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : 'No stack');
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        return NextResponse.json(
            { error: "Error al crear la cuenta", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
