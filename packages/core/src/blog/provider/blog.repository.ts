import { BlogPost, BlogPostProps } from "../model/blog-post.entity";
import { BlogComment, BlogCommentProps } from "../model/blog-comment.entity";

/**
 * Repository interface for Blog persistence operations.
 */
export interface IBlogRepository {
    // ============ BlogPost Operations ============

    /**
     * Find a blog post by ID
     */
    findPostById(id: string): Promise<BlogPost | null>;

    /**
     * Find a blog post by slug
     */
    findPostBySlug(slug: string): Promise<BlogPost | null>;

    /**
     * Find all blog posts with optional filtering
     */
    findAllPosts(params?: {
        skip?: number;
        take?: number;
        publishedOnly?: boolean;
        category?: string;
        tag?: string;
    }): Promise<BlogPost[]>;

    /**
     * Create a new blog post
     */
    createPost(post: BlogPost): Promise<BlogPost>;

    /**
     * Update a blog post
     */
    updatePost(id: string, data: Partial<BlogPostProps>): Promise<BlogPost>;

    /**
     * Delete a blog post
     */
    deletePost(id: string): Promise<void>;

    /**
     * Get distinct categories from published posts
     */
    getCategories(): Promise<string[]>;

    // ============ BlogComment Operations ============

    /**
     * Find comments for a specific post
     */
    findCommentsByPostId(postId: string): Promise<BlogComment[]>;

    /**
     * Find a comment by ID
     */
    findCommentById(id: string): Promise<BlogComment | null>;

    /**
     * Create a new comment
     */
    createComment(comment: BlogComment): Promise<BlogComment>;

    /**
     * Delete a comment
     */
    deleteComment(id: string): Promise<void>;
}
