import type { MetadataRoute } from "next";

const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        { url: appUrl, changeFrequency: "monthly", priority: 1 },
        { url: `${appUrl}/features`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${appUrl}/pricing`, changeFrequency: "monthly", priority: 0.8 },
        { url: `${appUrl}/register`, changeFrequency: "yearly", priority: 0.6 },
        { url: `${appUrl}/login`, changeFrequency: "yearly", priority: 0.4 },
    ];
}
