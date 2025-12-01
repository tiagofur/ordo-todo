import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        // Validar datos
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Todos los campos son requeridos" },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "La contraseña debe tener al menos 6 caracteres" },
                { status: 400 }
            );
        }

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
