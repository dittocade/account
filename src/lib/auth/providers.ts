import { GitHub, Discord } from "arctic";
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "astro:env/server";

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
export const discord = new Discord(
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URL,
);
