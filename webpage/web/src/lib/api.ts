export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    publishedAt: string;
    author?: string;
    tags: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getBlogPosts(): Promise<BlogPost[]> {
    try {
        const res = await fetch(`${API_URL}/blog`, {
            next: { revalidate: 60 }
        });

        if (!res.ok) return [];

        return res.json();
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        // Fallback to mock data to prevent page crash
        return [
            {
                id: '1',
                slug: 'welcome-to-ordo-todo',
                title: 'Welcome to Ordo Todo',
                excerpt: 'Discover the future of productivity.',
                content: 'Welcome to Ordo Todo...',
                publishedAt: new Date().toISOString(),
                tags: ['News', 'Productivity'],
                author: 'Ordo Team',
                coverImage: 'https://images.unsplash.com/photo-1499750310159-5b5f8ea37a85?auto=format&fit=crop&q=80'
            },
            {
                id: '2',
                slug: 'productivity-tips',
                title: '5 Tips to Boost Productivity',
                excerpt: 'Simple hacks to get more done.',
                content: 'Here are 5 tips...',
                publishedAt: new Date().toISOString(),
                tags: ['Guide'],
                author: 'Ordo Team',
                coverImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80'
            }
        ];
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
        // Fallback
        if (slug === 'welcome-to-ordo-todo') {
            return {
                id: '1',
                slug: 'welcome-to-ordo-todo',
                title: 'Welcome to Ordo Todo',
                excerpt: 'Discover the future of productivity.',
                content: 'Welcome to Ordo Todo. This is the content.',
                publishedAt: new Date().toISOString(),
                tags: ['News', 'Productivity'],
                author: 'Ordo Team',
                coverImage: 'https://images.unsplash.com/photo-1499750310159-5b5f8ea37a85?auto=format&fit=crop&q=80'
            };
        }
        return null;
    }
}
