import z from "zod";
import { URL_VALIDATION } from "../../shared/validation.constants.js";

export const SocialLinksSchema = z.object({
  twitter: URL_VALIDATION.optional(),
  github: URL_VALIDATION.optional(),
  linkedin: URL_VALIDATION.optional(),
  telegram: z.string().max(64).optional(),
}).optional();
