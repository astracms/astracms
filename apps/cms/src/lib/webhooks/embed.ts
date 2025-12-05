import { EmbedBuilder } from "@discordjs/builders";
import type { RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import type { WebhookBody } from "./webhook-client";

const ASTRA_COLOR = 5_786_879;
const ASTRA_AVATAR_URL = "https://app.astracms.dev/logo.png";

function formatEvent(input: string): string {
  return (
    input.replace(/\./g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) +
    "!"
  );
}

export function getDiscordEmbed(args: {
  event: WebhookBody["event"];
  data: WebhookBody["data"];
  username?: string;
}): RESTPostAPIWebhookWithTokenJSONBody {
  const { event, data, username } = args;

  const embed = new EmbedBuilder()
    .setTitle(formatEvent(event))
    .setDescription(event)
    .setColor(ASTRA_COLOR)
    .setAuthor({
      name: "AstraCMS",
      iconURL: ASTRA_AVATAR_URL,
    })
    .setFooter({
      text: "Powered by astracms.dev",
    });

  const fields = [
    { name: "ID", value: data.id },
    {
      name: "Performed By",
      value: username ? `${username} (${data.userId})` : data.userId,
    },
  ];

  if ("slug" in data) {
    fields.splice(1, 0, { name: "Slug", value: data.slug });
  } else if ("name" in data) {
    fields.splice(1, 0, { name: "Name", value: data.name });
  }

  embed.addFields(...fields);

  return {
    content: "title" in data ? data.title : undefined,
    username: "AstraCMS",
    avatar_url: ASTRA_AVATAR_URL,
    embeds: [embed.toJSON()],
    allowed_mentions: { parse: [] },
  };
}

export function getSlackMessage(args: {
  event: WebhookBody["event"];
  data: WebhookBody["data"];
  username?: string;
}) {
  const { event, data, username } = args;

  const fields = [
    `*ID:* ${data.id}`,
    `*Performed By:* ${username ? `${username} (${data.userId})` : data.userId}`,
  ];

  if ("slug" in data) {
    fields.splice(1, 0, `*Slug:* ${data.slug}`);
  } else if ("name" in data) {
    fields.splice(1, 0, `*Name:* ${data.name}`);
  }

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: formatEvent(event),
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: fields.join("\n"),
      },
      accessory: {
        type: "image",
        image_url: ASTRA_AVATAR_URL,
        alt_text: "AstraCMS",
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Powered by astracms.dev",
        },
      ],
    },
  ];

  return {
    text: "title" in data ? data.title : formatEvent(event),
    blocks,
  };
}
