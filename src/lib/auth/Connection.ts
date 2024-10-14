import type { OAuth2Provider, Tokens } from "arctic";
import { generateState } from "arctic";
import { lucia } from "@lib/auth";
import { generateIdFromEntropySize } from "lucia";
import type { APIContext } from "astro";
import { eq, and } from "drizzle-orm";
import { db, connections, users } from "@lib/db";

export abstract class Connection<Provider extends OAuth2Provider> {
  abstract slug: string;
  provider: Provider;
  abstract userInfoEndpoint: string;

  constructor(provider: Provider) {
    this.provider = provider;
  }

  async createAuthorizationURL(state: string): Promise<URL> {
    return await this.provider.createAuthorizationURL(state);
  }

  async fetchUserInfo(tokens: Tokens): Promise<User> {
    const response = await fetch(this.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    return await response.json();
  }

  async request({ cookies, redirect }: APIContext): Promise<Response> {
    const state = generateState();
    const url = await this.createAuthorizationURL(state);

    cookies.set(`${this.slug}_connection_state`, state, {
      path: "/",
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "lax",
    });

    return redirect(url.toString());
  }

  async remove({ locals, redirect }: APIContext): Promise<Response> {
    const { user } = locals;
    if (!user) return new Response(null, { status: 403 });
    await db
      .delete(connections)
      .where(
        and(
          eq(connections.provider, this.slug),
          eq(connections.userId, user.id),
        ),
      );
    return redirect("/");
  }

  async callback({
    locals,
    url,
    cookies,
    redirect,
  }: APIContext): Promise<Response> {
    const { user } = locals;
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies.get(`${this.slug}_connection_state`)?.value ?? null;
    if (!code || !state || !storedState || state !== storedState) {
      return new Response("Invalid session", {
        status: 400,
      });
    }

    try {
      const tokens = await this.provider.validateAuthorizationCode(code);
      const provided = await this.fetchUserInfo(tokens);

      const [connection] = await db
        .select({ userId: connections.userId })
        .from(connections)
        .where(
          and(
            eq(connections.provider, this.slug),
            eq(connections.identity, provided.id),
          ),
        );
      let userId = connection?.userId;

      if (!connection) {
        userId = user?.id ?? generateIdFromEntropySize(10);

        if (!user) {
          await db.insert(users).values({
            id: userId,
            slug: provided.login,
            name: provided.login,
          });
        }

        await db.insert(connections).values({
          userId,
          provider: this.slug,
          identity: provided.id,
        });
      }

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies.set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return redirect("/");
    } catch (e) {
      return new Response(String(e), {
        status: 500,
      });
    }
  }
}

export interface User {
  id: string;
  login: string;
}
