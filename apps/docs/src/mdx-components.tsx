import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Callout } from "fumadocs-ui/components/callout";
import { Card, Cards } from "fumadocs-ui/components/card";
import defaultMdxComponents from "fumadocs-ui/mdx";
import {
    FileTextIcon,
    FolderIcon,
    TagIcon,
    WebhookIcon,
    UsersIcon,
    BoxIcon,
    CodeIcon,
    ComponentIcon,
    RocketIcon,
    LayoutIcon,
    SparklesIcon,
    StarIcon,
} from "lucide-react";
import type { MDXComponents } from "mdx/types";
import { ReactIcon, NextjsIcon, Logo, VueIcon, NuxtIcon, SvelteIcon, AstroIcon } from "./components/icons";
import { APIPage } from "./components/api-page";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
    return {
        ...defaultMdxComponents,
        Tab,
        Tabs,
        Callout,
        Card,
        Cards,
        FileTextIcon,
        FolderIcon,
        TagIcon,
        WebhookIcon,
        UsersIcon,
        BoxIcon,
        CodeIcon,
        ComponentIcon,
        RocketIcon,
        LayoutIcon,
        SparklesIcon,
        StarIcon,
        ReactIcon,
        NextjsIcon,
        Logo,
        VueIcon,
        NuxtIcon,
        SvelteIcon,
        AstroIcon,
        APIPage,
        ...components,
    };
}
