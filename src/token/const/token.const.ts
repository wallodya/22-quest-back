const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

export const bcryptTokenHashSalt = 5;

export const ACCESS_TOKEN_LIFESPAN_MIN = process.env.AT_LIFESPAN_M;
export const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
export const ACCESS_TOKEN_EXPIRATION = ACCESS_TOKEN_LIFESPAN_MIN + "m";
export const ACCESS_TOKEN_HEADER_NAME = "Authorization";

export const REFRESH_TOKEN_EXPIRATION_D = Number(process.env.RT_LIFESPAN_D);
export const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
export const REFRESH_TOKEN_EXPIRATION = REFRESH_TOKEN_EXPIRATION_D + "d";
export const REFRESH_TOKEN_EXPIRATION_MS =
    REFRESH_TOKEN_EXPIRATION_D * MS_IN_A_DAY;
export const REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    expires: true,
    maxAge: MS_IN_A_DAY,
};
export const REFRESH_TOKEN_NAME = "Refresh-Token";
