import { Person } from "@prisma/client";

export type User = Omit<Person, "user_id">;

export type UserPublic = Omit<Person, "user_id" | "password">;
