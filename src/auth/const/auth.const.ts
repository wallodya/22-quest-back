import { TokenConst } from "token/const/token.const";

export const IS_PUBLIC_METADATA_KEY = "isPublic";
export const AUTH_STRATEGIES = {
    LOCAL: "local",
    JWT: "jwt",
    REFRESH: "jwt-refresh",
};

export class AuthConst {
    readonly JWT_SECRET: string;
    constructor(tokenConst: TokenConst) {
        this.JWT_SECRET = tokenConst.ACCESS_TOKEN_SECRET;
    }
}
