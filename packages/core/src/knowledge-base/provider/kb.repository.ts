import { KBCategory, KBArticle } from "../model";

export interface IKBRepository {
    // Categories
    findCategoryById(id: string): Promise<KBCategory | null>;
    findCategoryBySlug(slug: string): Promise<KBCategory | null>;
    findAllCategories(): Promise<KBCategory[]>;
    createCategory(category: KBCategory): Promise<KBCategory>;
    updateCategory(category: KBCategory): Promise<KBCategory>;
    deleteCategory(id: string): Promise<void>;

    // Articles
    findArticleById(id: string): Promise<KBArticle | null>;
    findArticleBySlug(slug: string): Promise<KBArticle | null>;
    findArticlesByCategory(categoryId: string, options?: { publishedOnly?: boolean }): Promise<KBArticle[]>;
    findAllArticles(options?: { publishedOnly?: boolean; categoryId?: string }): Promise<KBArticle[]>;
    createArticle(article: KBArticle): Promise<KBArticle>;
    updateArticle(article: KBArticle): Promise<KBArticle>;
    deleteArticle(id: string): Promise<void>;

    searchArticles(query: string): Promise<KBArticle[]>;
}
