import { defineConfig, envField } from "astro/config";
import netlify from "@astrojs/netlify";

export default defineConfig({
  env: {
    schema: {
      DATABASE_URL: envField.string({ context: "server", access: "secret" }),
      GITHUB_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      GITHUB_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      DISCORD_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
      }),
      DISCORD_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      DISCORD_REDIRECT_URL: envField.string({
        context: "server",
        access: "secret",
      }),
    },
  },
  security: {
    checkOrigin: import.meta.env.PROD,
  },
  adapter: import.meta.env.PROD ? netlify() : undefined,
  output: "server",
});
