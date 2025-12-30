import type { Metadata } from "next";

const APP_NAME = "Ordo Todo";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.ordotodo.com";

interface PageMetadataOptions {
    title: string;
    description: string;
    path?: string;
    noIndex?: boolean;
}

/**
 * Generates consistent metadata for pages.
 * 
 * @example
 * ```ts
 * export const metadata = generatePageMetadata({
 *   title: "Tasks",
 *   description: "Manage your tasks efficiently",
 * });
 * ```
 */
export function generatePageMetadata({
    title,
    description,
    path = "",
    noIndex = false,
}: PageMetadataOptions): Metadata {
    const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;
    const url = `${APP_URL}${path}`;

    return {
        title: fullTitle,
        description,
        robots: noIndex ? "noindex, nofollow" : "index, follow",
        openGraph: {
            title: fullTitle,
            description,
            url,
            siteName: APP_NAME,
            type: "website",
            locale: "es_ES",
            alternateLocale: ["en_US", "pt_BR"],
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
        },
        alternates: {
            canonical: url,
            languages: {
                es: `${APP_URL}/es${path}`,
                en: `${APP_URL}/en${path}`,
                "pt-br": `${APP_URL}/pt-br${path}`,
            },
        },
    };
}

/**
 * Default metadata for pages that don't specify their own.
 */
export const defaultMetadata: Metadata = {
    metadataBase: new URL(APP_URL),
    title: {
        default: APP_NAME,
        template: `%s | ${APP_NAME}`,
    },
    description: "La aplicación de productividad definitiva. Gestiona tareas, proyectos y hábitos con inteligencia artificial.",
    keywords: [
        "productividad",
        "tareas",
        "proyectos",
        "hábitos",
        "gestión del tiempo",
        "pomodoro",
        "todo",
        "task manager",
        "AI",
        "inteligencia artificial",
    ],
    authors: [{ name: "Ordo Team" }],
    creator: "Ordo Team",
    publisher: "Ordo Todo",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    openGraph: {
        type: "website",
        locale: "es_ES",
        alternateLocale: ["en_US", "pt_BR"],
        siteName: APP_NAME,
        title: APP_NAME,
        description: "La aplicación de productividad definitiva",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Ordo Todo - Productividad Inteligente",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: APP_NAME,
        description: "La aplicación de productividad definitiva",
        images: ["/twitter-image.png"],
    },
    verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
    },
};
