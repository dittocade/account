import { z } from "astro:schema";
import slugify from "@sindresorhus/slugify";
import zxcvbn from "zxcvbn";

export const emptyString = () => z.literal("").transform(() => null);

export const slug = () =>
  z.preprocess(
    (val) => slugify(z.string().parse(val)),
    z.string().min(3).max(16),
  );

export const password = (verbose = false) =>
  z.string().superRefine((val, ctx) => {
    const result = zxcvbn(val);
    if (result.score < 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: result.feedback.warning || "This password is insecure",
      });
      if (!verbose) return;
      for (const suggestion of result.feedback.suggestions) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: suggestion.replace(/\.$/, ""),
        });
      }
    }
  });
