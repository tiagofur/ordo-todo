import { FAQ } from "../model/faq.entity";

export interface IFAQRepository {
    findById(id: string): Promise<FAQ | null>;
    findAll(options?: { publishedOnly?: boolean; category?: string }): Promise<FAQ[]>;
    create(faq: FAQ): Promise<FAQ>;
    update(faq: FAQ): Promise<FAQ>;
    delete(id: string): Promise<void>;
    getCategories(): Promise<string[]>;
}
