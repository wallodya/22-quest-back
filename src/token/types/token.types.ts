import { Prisma } from "@prisma/client";
import { UserPublic } from "user/types/user";

export type JwtToken = {
    sub: any;
    exp: number;
    iat: number;
};

export type RefreshToken = {
    sub: {
        uuid: string;
        token: string;
    };
} & JwtToken;

export type UserPublicToken = {
    sub: UserPublic;
} & JwtToken;

export type UserSession = Prisma.TokenMaxAggregateOutputType;

export type SetRefreshTokenExpArgs = {
    expiresIn: number;
    refreshToken: string;
};
