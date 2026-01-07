import { Entity, EntityProps } from "../../shared/entity";

export interface FAQProps extends EntityProps {
    question: string;
    answer: string;
    category: string;
    order: number;
    published: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class FAQ extends Entity<FAQProps> {
    constructor(props: FAQProps) {
        super({
            ...props,
            order: props.order ?? 0,
            published: props.published ?? true,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<FAQProps, "id" | "createdAt" | "updatedAt">): FAQ {
        return new FAQ({
            ...props,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get question(): string {
        return this.props.question;
    }

    get answer(): string {
        return this.props.answer;
    }

    get category(): string {
        return this.props.category;
    }

    get order(): number {
        return this.props.order;
    }

    get published(): boolean {
        return this.props.published;
    }

    update(props: Partial<Omit<FAQProps, "id" | "createdAt" | "updatedAt">>): FAQ {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
