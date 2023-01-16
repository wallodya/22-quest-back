import { Person } from "@prisma/client";

export type UserSessions = Person & {
    tokens: string[];
};
