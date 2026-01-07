import { Entity, EntityProps } from "../../shared/entity";
import { KBArticle } from "./kb-article.entity";

export interface KBCategoryProps extends EntityProps {
    name: string;
    slug: string;
    icon?: string;
    order: number;
    articles?: KBArticle[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class KBCategory extends Entity<KBCategoryProps> {
    constructor(props: KBCategoryProps) {
        super({
            ...props,
            order: props.order ?? 0,
            articles: props.articles ?? [],
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        });
    }

    static create(props: Omit<KBCategoryProps, "id" | "createdAt" | "updatedAt" | "articles">): KBCategory {
        return new KBCategory({
            ...props,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get name(): string { return this.props.name; }
    get slug(): string { return this.props.slug; }
    get icon(): string | undefined { return this.props.icon; }
    get order(): number { return this.props.order; }
    get articles(): KBArticle[] { return this.props.articles || []; }

    update(props: Partial<Omit<KBCategoryProps, "id" | "createdAt" | "updatedAt" | "articles">>): KBCategory {
        return this.clone({
            ...props,
            updatedAt: new Date(),
        });
    }
}
