import { docs } from "fumadocs-mdx:collections/server";
import {
  type InferMetaType,
  type InferPageType,
  type LoaderPlugin,
  loader,
} from "fumadocs-core/source";
import { lucideIconsPlugin } from "fumadocs-core/source/lucide-icons";
import { openapiPlugin } from "fumadocs-openapi/server";
import {
  SvelteIcon,
  AstroIcon,
  NuxtIcon,
  VueIcon,
  ReactIcon,
  NextjsIcon,
} from "@/components/icons";

const customIcons: Record<string, React.ReactElement> = {
  SvelteIcon: <SvelteIcon />,
  AstroIcon: <AstroIcon />,
  NuxtIcon: <NuxtIcon />,
  VueIcon: <VueIcon />,
  ReactIcon: <ReactIcon />,
  NextjsIcon: <NextjsIcon />,
};

function customIconsPlugin(): LoaderPlugin {
  return {
    transformPageTree: {
      file(node) {
        if (typeof node.icon === "string" && node.icon in customIcons) {
          return {
            ...node,
            icon: customIcons[node.icon],
          };
        }
        return node;
      },
    },
  };
}

export const source = loader({
  baseUrl: "/",
  plugins: [pageTreeCodeTitles(), customIconsPlugin(), lucideIconsPlugin(), openapiPlugin()],
  source: docs.toFumadocsSource(),
});

function pageTreeCodeTitles(): LoaderPlugin {
  return {
    transformPageTree: {
      file(node) {
        if (
          typeof node.name === "string" &&
          (node.name.endsWith("()") || node.name.match(/^<\w+ \/>$/))
        ) {
          return {
            ...node,
            name: <code className="text-[0.8125rem]">{node.name}</code>,
          };
        }
        return node;
      },
    },
  };
}

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;

