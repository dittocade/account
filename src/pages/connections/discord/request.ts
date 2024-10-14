import { discord } from "@lib/auth/connections";
export const GET = discord.request.bind(discord);
