import { PrismaClient, User as PrismaUser } from "@prisma/client";
import { User, UserRepository } from "@ordo-todo/core";

export class PrismaUserRepository implements UserRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private toDomain(prismaUser: PrismaUser): User {
        // Assuming prismaUser.hashedPassword stores the hashed password
        return new User({
            id: prismaUser.id,
            username: prismaUser.username ?? '',
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

    // Define the select fields needed for domain conversion
    private readonly userSelectFields = {
        id: true,
        email: true,
        username: true,
        name: true,
        hashedPassword: true,
        createdAt: true,
        updatedAt: true,
    } as const;

    async findByEmail(email: string, withPassword?: boolean): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: this.userSelectFields,
        });
        if (!user) return null;

        const domainUser = this.toDomain(user as any);
        if (!withPassword) {
            return domainUser.withoutPassword();
        }
        return domainUser;
    }

    async findByUsername(username: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: this.userSelectFields,
        });
        if (!user) return null;
        return this.toDomain(user as any);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: this.userSelectFields,
        });
        if (!user) return null;
        return this.toDomain(user as any);
    }

    async findByProvider(provider: string, providerId: string): Promise<User | null> {
        // Assuming standard account table from auth/prisma-adapter
        const account = await this.prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider,
                    providerAccountId: providerId,
                },
            },
            include: { user: true },
        });

        if (!account || !account.user) return null;
        return this.toDomain(account.user as any);
    }

    async linkOAuthAccount(
        userId: string,
        provider: string,
        providerId: string
    ): Promise<User> {
        await this.prisma.account.create({
            data: {
                userId,
                type: 'oauth',
                provider,
                providerAccountId: providerId,
            },
        });

        const user = await this.findById(userId);
        if (!user) throw new Error("User not found after linking account");
        return user;
    }

    // Since interface imports CreateUserProps, we need it too.
    // However, I can't import it in 'ReplacementContent' easily without changing the top of file.
    // I will use 'any' for props type in signature to satisfy TS if interface matches by structure,
    // OR I will assume 'props' matches CreateUserProps structure.
    // Actually, I should update imports first.
    // But since this is a 'replace_file_content' at the end, I can't easily change top imports.
    // I will use the 'multi_replace' or just update the whole file to be safe?
    // No, I'll allow 'any' for now or just standard object.

    async create(props: { name: string; email: string; username: string; image?: string | null; provider?: string; providerId?: string }): Promise<User> {
        const user = await this.prisma.user.create({
            data: {
                name: props.name,
                email: props.email,
                username: props.username,
                image: props.image,
            },
        });

        if (props.provider && props.providerId) {
            await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: 'oauth',
                    provider: props.provider,
                    providerAccountId: props.providerId,
                },
            });
        }

        return this.toDomain(user as any);
    }

    async updateXpAndLevel(
        userId: string,
        xp: number,
        level: number,
    ): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                xp,
                level,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }
}
