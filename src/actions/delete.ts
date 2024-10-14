import { ActionError, defineAction } from "astro:actions";
import {db, users, sessions, connections} from "@lib/db"
import { eq } from "drizzle-orm";
import { z } from "astro:schema";
import { slug } from "@lib/schema";

export const del = defineAction({
  accept: "form",
  input: z.object({
    slug: slug()
  }),
  handler: async ({slug}, { locals: { user } }) => {
    if (!user)
      throw new ActionError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to log out",
      });
    if (slug !== user.slug) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "You entered the wrong username"
      })
    }

    await db.delete(connections).where(eq(connections.userId, user.id))
    await db.delete(sessions).where(eq(sessions.userId, user.id))
    await db.delete(users).where(eq(users.id, user.id))
  },
});
