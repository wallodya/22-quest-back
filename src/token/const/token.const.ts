import { Injectable } from "@nestjs/common";
import { CookieOptions } from "express";

@Injectable()
export class TokenConst {
    readonly MS_IN_A_DAY = 1000 * 60 * 60 * 24;
    readonly bcryptTokenHashSalt = 5;
    readonly ACCESS_TOKEN_LIFESPAN_MIN = process.env.AT_LIFESPAN_M;
    readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
    readonly ACCESS_TOKEN_EXPIRATION = this.ACCESS_TOKEN_LIFESPAN_MIN + "m";
    readonly ACCESS_TOKEN_HEADER_NAME = "Authorization";

    readonly REFRESH_TOKEN_EXPIRATION_D = Number(process.env.RT_LIFESPAN_D);
    readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
    readonly REFRESH_TOKEN_EXPIRATION = this.REFRESH_TOKEN_EXPIRATION_D + "d";
    readonly REFRESH_TOKEN_EXPIRATION_MS =
        this.REFRESH_TOKEN_EXPIRATION_D * this.MS_IN_A_DAY;
    readonly REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
        httpOnly: true,
        // expires: true,
        maxAge: this.MS_IN_A_DAY,
        sameSite: "none",
        secure: true,
    };
    readonly REFRESH_TOKEN_NAME = "Refresh-Token";
}
