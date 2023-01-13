export const bcryptTokenHashSalt = 5;
export const ACCESS_TOKEN_EXPIRATION = process.env.AT_LIFESPAN_M + "m";
export const REFRESH_TOKEN_EXPIRATION = process.env.RT_LIFESPAN_D + "d";
export const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
