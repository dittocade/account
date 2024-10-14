import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { slug, password } from "@lib/schema";
import { db, users } from "@lib/db";
import { lucia, hashOptions } from "@lib/auth/index";
import { hash, verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";

export const login = defineAction({
  accept: "form",
  input: z.object({
    slug: slug(),
    password: password(),
  }),
  handler: async ({ slug, password }, { cookies }) => {
    const [user] = await db.select().from(users).where(eq(users.slug, slug));
    let userId = user?.id;

    if (user) {
      const passwordValid = await verify(
        user.password ?? "",
        password,
        hashOptions,
      );
      if (!user.password || !passwordValid)
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "The entered slug or password is incorrect.",
        });
    } else {
      userId = generateIdFromEntropySize(10);
      await db.insert(users).values({
        id: userId,
        name: slug,
        slug,
        password: await hash(password, hashOptions),
      });
    }

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies.set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  },
});
