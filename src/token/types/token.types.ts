import { UserPublic } from "types/user";

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
