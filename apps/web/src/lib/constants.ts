import type { SvgComponent } from "astro/types";
import Github from "../components/icons/Github.astro";
import X from "../components/icons/X.astro";
// import Discord from "../assets/icons/discord.svg";
export type Site = {
  TITLE: string;
  DESCRIPTION: string;
  EMAIL: string;
  URL: string;
  APP_URL: string;
};

export type Link = {
  href: string;
  label: string;
};

export const SITE: Site = {
  TITLE: "AstraCMS",
  DESCRIPTION:
    "A simple, collaborative CMS for publishing articles, changelogs, and product updates.",
  EMAIL: "support@astracms.dev",
  URL: "https://www.astracms.dev",
  APP_URL: "https://app.astracms.dev",
};

export const SOCIAL_LINKS: Link[] = [
  { href: "https://github.com/astracms", label: "GitHub" },
  { href: "https://x.com/astracms", label: "Twitter" },
  // { href: "https://discord.gg/gU44Pmwqkx", label: "Discord" },
  { href: "support@astracms.dev", label: "Email" },
  { href: "/rss.xml", label: "RSS" },
];

export const FAQs: {
  question: string;
  answer: string;
}[] = [
  {
    question: "What is AstraCMS?",
    answer:
      "AstraCMS is a headless CMS designed specifically for managing blogs, changelogs, and articles. It provides a simple interface for creating and organizing content, along with a powerful API to fetch and display it on your website or app.",
  },
  {
    question: "Is AstraCMS free?",
    answer:
      "Yes, AstraCMS is free to use with generous limits on all core features. We also offer paid plans for teams needing higher limits and advanced features.",
  },
  {
    question: "How does AstraCMS work?",
    answer:
      "AstraCMS is a headless CMS that provides content management through a simple API. You can create, edit and manage content through our dashboard, then fetch it via our API to display on your website or app.",
  },
  {
    question: "Do I need technical knowledge to use AstraCMS?",
    answer:
      "No technical knowledge is required to use our content management dashboard. However, to integrate the API with your website or app, basic development experience is helpful. We provide detailed documentation and templates to make integration easy.",
  },
  {
    question: "What kind of content can I manage?",
    answer:
      "AstraCMS is primarily focused on managing blog posts, changelogs, articles, and static pages. We support rich text, images, and videos to help you create engaging content for your blog or documentation site.",
  },
  {
    question: "Is there a limit on API requests?",
    answer:
      "Free accounts include 10.000 API requests per month. We implement fair usage policies to prevent abuse but typical usage patterns are well within our limits.",
  },
  {
    question: "Can I export my content?",
    answer:
      "Yes, you can export all your content at any time in common formats like JSON, HTML or Markdown. Your content always belongs to you and you are never locked in.",
  },
];

export type Pricing = {
  title: string;
  description: string;
  price: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  button: {
    href: string;
    label: string;
  };
};

export const PRICING: Pricing[] = [
  {
    title: "Hobby",
    description: "For Hobbyists",
    price: {
      monthly: "$0",
      yearly: "$0",
    },
    features: [
      "Unlimited posts",
      "5GB media storage",
      "2 team members",
      "10k API requests per month",
      "100 AI credits per month ≈ 5 articles",
    ],
    button: {
      href: "https://app.astracms.dev",
      label: "Start for free",
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
      "50GB media storage",
      "5 team members",
      "1,000 AI credits per month ≈ 50 articles",
      "Advanced readability insights",
      "50k API requests per month",
      "50 webhook events per month",
    ],
    button: {
      href: "https://app.astracms.dev",
      label: "Start 7 day free trial",
    },
  },
  {
    title: "Enterprise",
    description: "For Growing Organizations",
    price: {
      monthly: "$99",
      yearly: "$950",
    },
    features: [
      "Unlimited posts",
      "250GB media storage",
      "10 team members",
      "10,000 AI credits per month ≈ 500 articles",
      "Full AI suite (readability + keyword optimization)",
      "Unlimited API requests",
      "100 webhook events per month",
      "Priority support",
    ],
    button: {
      href: "https://app.astracms.dev",
      label: "Start 7 day free trial",
    },
  },
];

export const PRICING_FAQS: {
  question: string;
  answer: string;
}[] = [
  {
    question: "How are plans billed?",
    answer:
      "Our plans are billed per workspace, not per user. This means you can invite as many team members as your plan allows to a workspace without any extra charges per member. Each workspace requires its own subscription if you wish to upgrade it.",
  },
  {
    question: "How do I get a refund?",
    answer:
      "To request a refund, please contact us at <a href='mailto:support@astracms.dev'>support@astracms.dev</a> within 7 business days of your purchase. We respond to all refund requests within 3 business days. We're also available on X at <a href='https://x.com/astracms'>astracms</a>.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your workspace billing settings. Prorated charges or credits will be applied automatically.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, including Visa, Mastercard, and American Express. All payments are processed securely via <a href='https://creem.io'>Creem.io</a>.",
  },
  {
    question: "What happens when I downgrade my plan?",
    answer:
      "When you downgrade, you'll retain access to paid features until the end of your current billing cycle. Afterward, your workspace will be moved to the Free plan, and some features may become unavailable.",
  },
];

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  target?: string;
  rel?: string;
  icon?: SvgComponent;
};

export type FooterSection = {
  title: string;
  links: FooterLink[];
};

export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      {
        label: "Get Started",
        href: SITE.APP_URL,
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
    ],
  },
  {
    title: "Developers",
    links: [
      {
        label: "Documentation",
        href: "https://docs.astracms.dev",
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
        href: "mailto:support@astracms.dev",
      },
      {
        label: "Terms",
        href: "/terms",
      },
      {
        label: "Privacy",
        href: "/privacy",
      },
    ],
  },
];

export const FOOTER_SOCIAL_LINKS: FooterLink[] = [
  {
    label: "Twitter",
    href: "https://x.com/astracms",
    external: true,
    target: "_blank",
    rel: "noopener",
    icon: X,
  },
  {
    label: "Github",
    href: "https://github.com/astracms",
    external: true,
    target: "_blank",
    rel: "noopener",
    icon: Github,
  },
  // {
  //   label: "Discord",
  //   href: "https://discord.astracms.dev",
  //   external: true,
  //   target: "_blank",
  //   rel: "noopener",
  //   icon: Discord,
  // },
];
