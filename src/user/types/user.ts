import { Person } from "@prisma/client";

export type User = Person;

export type UserPublic = Omit<Person, "user_id" | "password">;
