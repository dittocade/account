import * as arctic from "arctic"
import * as providers from "./providers";
import { Connection } from "./Connection";

export class GitHub extends Connection<arctic.GitHub> {
  slug = "github";
  userInfoEndpoint = "https://api.github.com/user";
}

export const github = new GitHub(providers.github);

export class Discord extends Connection<arctic.Discord> {
  slug = "discord";
  userInfoEndpoint = "https://discord.com/api/users/@me";

  async createAuthorizationURL(state: string) {
    return await this.provider.createAuthorizationURL(state, {
      scopes: ["identify"],
    });
  }
}

export const discord = new Discord(providers.discord);
