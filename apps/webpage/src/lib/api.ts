export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    publishedAt: string;
    author?: string;
    category?: string;
    tags: string[];
    readTime?: number;
    comments?: BlogComment[];
}

export interface BlogComment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        image?: string;
    };
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: 'CONSIDERING' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
    totalVotes: number;
    _count?: { votes: number };
}

export interface ChangelogEntry {
    id: string;
    version?: string;
    title: string;
    content: string;
    type: 'NEW' | 'IMPROVED' | 'FIXED' | 'REMOVED';
    publishedAt: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101/api/v1';

// Helper for authenticated requests
function getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('ordo_token');
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
}

// ==================== BLOG ====================

export async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const res = await fetch(`${API_URL}/blog`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
        const res = await fetch(`${API_URL}/blog/${slug}`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error(`Failed to fetch blog post ${slug}`, error);
        return null;
    }
}

export async function getBlogComments(slug: string): Promise<BlogComment[]> {
    try {
        const res = await fetch(`${API_URL}/blog/${slug}/comments`);
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

export async function addBlogComment(slug: string, content: string): Promise<BlogComment | null> {
    try {
        const res = await fetch(`${API_URL}/blog/${slug}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify({ content }),
        });
        if (!res.ok) {
            if (res.status === 401) throw new Error('LOGIN_REQUIRED');
            throw new Error('Failed to add comment');
        }
        return res.json();
    } catch (error) {
        console.error('Error adding comment:', error);
        throw error;
    }
}

export async function deleteBlogComment(commentId: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/blog/comments/${commentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (error) {
        console.error('Error deleting comment:', error);
        return false;
    }
}

// ==================== CHANGELOG ====================

export async function getChangelogEntries(): Promise<ChangelogEntry[]> {
    try {
        const res = await fetch(`${API_URL}/changelog`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching changelog:', error);
        return [];
    }
}

// ==================== FAQ ====================

export async function getFAQs(): Promise<FAQ[]> {
    try {
        const res = await fetch(`${API_URL}/faq`, {
            next: { revalidate: 60 }
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return [];
    }
}

// ==================== ROADMAP ====================

export async function getRoadmapItems(): Promise<RoadmapItem[]> {
    try {
        const res = await fetch(`${API_URL}/roadmap`, {
            next: { revalidate: 30 }
        });
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching roadmap:', error);
        return [];
    }
}

export async function voteRoadmapItem(itemId: string): Promise<{ success: boolean; weight: number }> {
    const res = await fetch(`${API_URL}/roadmap/${itemId}/vote`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        if (res.status === 401) throw new Error('LOGIN_REQUIRED');
        if (res.status === 409) throw new Error('ALREADY_VOTED');
        throw new Error('Failed to vote');
    }
    return res.json();
}

export async function removeRoadmapVote(itemId: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/roadmap/${itemId}/vote`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.ok;
}

// ==================== NEWSLETTER ====================

export async function subscribeNewsletter(email: string): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return res.ok;
    } catch (error) {
        console.error('Error subscribing:', error);
        return false;
    }
}

export async function subscribeNewsletterWithAccount(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/newsletter/subscribe/me`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (error) {
        console.error('Error subscribing:', error);
        return false;
    }
}

export async function unsubscribeNewsletter(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/newsletter/unsubscribe/me`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return res.ok;
    } catch (error) {
        console.error('Error unsubscribing:', error);
        return false;
    }
}

export async function getNewsletterStatus(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/newsletter/status`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return false;
        return res.json();
    } catch (error) {
        return false;
    }
}

// ==================== CONTACT ====================

export async function submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
}): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.ok;
    } catch (error) {
        console.error('Error submitting contact form:', error);
        return false;
    }
}
