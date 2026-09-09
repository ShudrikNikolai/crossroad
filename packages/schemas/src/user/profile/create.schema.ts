import { USERNAME_VALIDATION } from "@/shared/validation.constants.js";
import z from "zod";

export const CreateProfileSchema = z.object({
  userId: z.string().min(1),
  username: USERNAME_VALIDATION
});

export type TCreateProfileSchema = z.infer<typeof CreateProfileSchema>
