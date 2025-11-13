"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOOTER_SOCIAL_LINKS = exports.FOOTER_SECTIONS = exports.USERS = exports.PRICING_FAQS = exports.PRICING = exports.FAQs = exports.SOCIAL_LINKS = exports.SITE = void 0;
var Bounty_astro_1 = require("@/components/icons/brand/Bounty.astro");
var Databuddy_astro_1 = require("@/components/icons/brand/Databuddy.astro");
var Helix_astro_1 = require("@/components/icons/brand/Helix.astro");
var Ia_astro_1 = require("@/components/icons/brand/Ia.astro");
var Mantlz_astro_1 = require("@/components/icons/brand/Mantlz.astro");
var Opencut_astro_1 = require("@/components/icons/brand/Opencut.astro");
var Discord_astro_1 = require("@/components/icons/Discord.astro");
var Github_astro_1 = require("@/components/icons/Github.astro");
var X_astro_1 = require("@/components/icons/X.astro");
exports.SITE = {
    TITLE: "Astracms",
    DESCRIPTION: "A simple, collaborative CMS for publishing articles, changelogs, and product updates.",
    EMAIL: "support@astracms.com",
    URL: "https://astracms.com",
    APP_URL: "https://app.astracms.com",
};
exports.SOCIAL_LINKS = [
    { href: "https://github.com/astracms", label: "GitHub" },
    { href: "https://x.com/astracms", label: "Twitter" },
    { href: "https://discord.gg/gU44Pmwqkx", label: "Discord" },
    { href: "support@astracms.com", label: "Email" },
    { href: "/rss.xml", label: "RSS" },
];
exports.FAQs = [
    {
        question: "What is Astracms?",
        answer: "Astracms is a headless CMS designed specifically for managing blogs, changelogs, and articles. It provides a simple interface for creating and organizing content, along with a powerful API to fetch and display it on your website or app.",
    },
    {
        question: "Is Astracms free?",
        answer: "Yes, Astracms is free to use with generous limits on all core features. We also offer paid plans for teams needing higher limits and advanced features.",
    },
    {
        question: "How does Astracms work?",
        answer: "Astracms is a headless CMS that provides content management through a simple API. You can create, edit and manage content through our dashboard, then fetch it via our API to display on your website or app.",
    },
    {
        question: "Do I need technical knowledge to use AstraCMS?",
        answer: "No technical knowledge is required to use our content management dashboard. However, to integrate the API with your website or app, basic development experience is helpful. We provide detailed documentation and templates to make integration easy.",
    },
    {
        question: "What kind of content can I manage?",
        answer: "Astracms is primarily focused on managing blog posts, changelogs, articles, and static pages. We support rich text, images, and videos to help you create engaging content for your blog or documentation site.",
    },
    {
        question: "Is there a limit on API requests?",
        answer: "Free accounts include 10.000 API requests per month. We implement fair usage policies to prevent abuse but typical usage patterns are well within our limits.",
    },
    {
        question: "Can I export my content?",
        answer: "Yes, you can export all your content at any time in common formats like JSON, HTML or Markdown. Your content always belongs to you and you are never locked in.",
    },
];
exports.PRICING = [
    {
        title: "Hobby",
        description: "For Hobbyists",
        price: {
            monthly: "$0",
            yearly: "$0",
        },
        features: [
            "Unlimited posts",
            "1GB media storage",
            "2 member seats",
            "AI Readability insights",
            "10k API requests per month",
            "100 webhook events per month",
        ],
        button: {
            href: "https://app.astracms.com",
            label: "Get Started",
        },
    },
    {
        title: "Pro",
        description: "For Small Teams",
        price: {
            monthly: "$20",
            yearly: "$180",
        },
        features: [
            "Unlimited posts",
            "10GB media storage",
            "10 member seats",
            "AI Readability insights",
            "50k API requests per month",
            "1k webhook events per month",
        ],
        button: {
            href: "https://app.astracms.com",
            label: "Get Started",
        },
    },
];
exports.PRICING_FAQS = [
    {
        question: "How are plans billed?",
        answer: "Our plans are billed per workspace, not per user. This means you can invite as many team members as your plan allows to a workspace without any extra charges per member. Each workspace requires its own subscription if you wish to upgrade it.",
    },
    {
        question: "How do I get a refund?",
        answer: "To request a refund, please contact us at <a href='mailto:support@astracms.com'>support@astracms.com</a> within 7 days of your purchase. We're also available on X at <a href='https://x.com/astracms'>astracms</a> and on our <a href='https://discord.gg/gU44Pmwqkx'>Discord</a> channel.",
    },
    {
        question: "Can I change my plan later?",
        answer: "Yes, you can upgrade or downgrade your plan at any time from your workspace billing settings. Prorated charges or credits will be applied automatically.",
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, including Visa, Mastercard, and American Express. All payments are processed securely via <a href='https://polar.sh'>Polar</a>.",
    },
    {
        question: "What happens when I downgrade my plan?",
        answer: "When you downgrade, you'll retain access to paid features until the end of your current billing cycle. Afterward, your workspace will be moved to the Free plan, and some features may become unavailable.",
    },
];
exports.USERS = [
    {
        name: "I.A",
        url: "https://independent-arts.org",
        component: Ia_astro_1.default,
        showWordmark: true,
    },
    {
        name: "OpenCut",
        url: "https://opencut.app",
        component: Opencut_astro_1.default,
        showWordmark: true,
    },
    {
        name: "Mantlz",
        url: "https://mantlz.com",
        component: Mantlz_astro_1.default,
        showWordmark: true,
    },
    {
        name: "Bounty",
        url: "https://bounty.new",
        component: Bounty_astro_1.default,
        showWordmark: false,
    },
    {
        name: "Helix DB",
        url: "https://www.helix-db.com",
        component: Helix_astro_1.default,
        showWordmark: true,
    },
    {
        name: "Databuddy",
        url: "https://databuddy.cc",
        component: Databuddy_astro_1.default,
        showWordmark: true,
    },
];
exports.FOOTER_SECTIONS = [
    {
        title: "Product",
        links: [
            {
                label: "Get Started",
                href: exports.SITE.APP_URL,
            },
            {
                label: "Pricing",
                href: "/pricing",
            },
            {
                label: "Changelog",
                href: "/changelog",
            },
        ],
    },
    {
        title: "Resources",
        links: [
            {
                label: "Blog",
                href: "/blog",
            },
            {
                label: "Feed",
                href: "/rss.xml",
            },
            {
                label: "Contributors",
                href: "/contributors",
            },
        ],
    },
    {
        title: "Developers",
        links: [
            {
                label: "Documentation",
                href: "https://docs.astracms.com",
                external: true,
                target: "_blank",
                rel: "noopener",
            },
            {
                label: "Astro Example",
                href: "https://github.com/astracms/astro-example",
                external: true,
                target: "_blank",
                rel: "noopener",
            },
            {
                label: "Next.js Example",
                href: "https://github.com/astracms/nextjs-example",
                external: true,
                target: "_blank",
                rel: "noopener",
            },
            {
                label: "TanStack Example",
                href: "https://github.com/astracms/tanstack-start-example",
                external: true,
                target: "_blank",
                rel: "noopener",
            },
        ],
    },
    {
        title: "Company",
        links: [
            {
                label: "Contact",
                href: "mailto:support@astracms.com",
            },
            {
                label: "Terms",
                href: "/terms",
            },
            {
                label: "Privacy",
                href: "/privacy",
            },
            {
                label: "Sponsors",
                href: "/sponsors",
            },
        ],
    },
];
exports.FOOTER_SOCIAL_LINKS = [
    {
        label: "Twitter",
        href: "https://x.com/astracms",
        external: true,
        target: "_blank",
        rel: "noopener",
        icon: X_astro_1.default,
    },
    {
        label: "Github",
        href: "https://github.com/astracms",
        external: true,
        target: "_blank",
        rel: "noopener",
        icon: Github_astro_1.default,
    },
    {
        label: "Discord",
        href: "https://discord.astracms.com",
        external: true,
        target: "_blank",
        rel: "noopener",
        icon: Discord_astro_1.default,
    },
];
