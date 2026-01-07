import { Entity, EntityProps } from "../../shared/entity";

export interface KBArticleProps extends EntityProps {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    categoryId: string;
    helpfulYes: number;
    helpfulNo: number;
    published: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class KBArticle extends Entity<KBArticleProps> {
    constructor(props: KBArticleProps) {
        super({
            ...props,
            helpfulYes: props.helpfulYes ?? 0,
            helpfulNo: props.helpfulNo ?? 0,
            published: props.published ?? false,
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<KBArticleProps, "id" | "createdAt" | "updatedAt" | "helpfulYes" | "helpfulNo">): KBArticle {
        return new KBArticle({
            ...props,
            helpfulYes: 0,
            helpfulNo: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get slug(): string { return this.props.slug; }
    get title(): string { return this.props.title; }
    get content(): string { return this.props.content; }
    get categoryId(): string { return this.props.categoryId; }
    get helpfulYes(): number { return this.props.helpfulYes; }
    get helpfulNo(): number { return this.props.helpfulNo; }
    get published(): boolean { return this.props.published; }

    update(props: Partial<Omit<KBArticleProps, "id" | "createdAt" | "updatedAt">>): KBArticle {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }

    voteHelpful(yes: boolean): KBArticle {
        return this.clone({
            helpfulYes: yes ? this.helpfulYes + 1 : this.helpfulYes,
            helpfulNo: !yes ? this.helpfulNo + 1 : this.helpfulNo,
            updatedAt: new Date(),
        });
    }
}
