import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { User, UserRepository } from "@ordo-todo/core";

export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private toDomain(prismaUser: PrismaUser): User {
        // Assuming prismaUser.hashedPassword stores the hashed password
        return new User({
            id: prismaUser.id,
            username: prismaUser.username,
            name: prismaUser.name ?? undefined,
            email: prismaUser.email,
            password: (prismaUser as any).hashedPassword ?? undefined,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        });
    }

    async save(user: User): Promise<void> {
        const data = {
            id: user.id as string,
            username: user.username,
            name: user.name,
            email: user.email,
            hashedPassword: user.password,
            updatedAt: (user.props as any).updatedAt,
        };

        await this.prisma.user.upsert({
            where: { id: user.id as string },
            create: data,
            update: data,
        });
    }

    async updateProps(user: User, props: Partial<any>): Promise<void> {
        // This method signature in interface is `updateProps(user: User, props: Partial<UserProps>): Promise<void>`
        // But here I'm implementing it.
        // Actually, the interface says `updateProps(user: User, props: Partial<UserProps>)`.
        // I should probably just use `save` or `update` with the updated user.
        // But if I need to update specific props...
        // For now I'll just implement it using update.

        await this.prisma.user.update({
            where: { id: user.id as string },
            data: {
                name: props.name,
                email: props.email,
                hashedPassword: props.password,
                updatedAt: new Date(),
            }
        });
    }

    async findByEmail(email: string, withPassword?: boolean): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const domainUser = this.toDomain(user);
        if (!withPassword) {
            return domainUser.withoutPassword();
        }
        return domainUser;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { username } });
        if (!user) return null;
        return this.toDomain(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) return null;
        return this.toDomain(user);
    }
}
