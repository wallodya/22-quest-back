import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "auth/auth.service";
import { AUTH_STRATEGIES } from "auth/const/auth.const";
import { Strategy } from "passport-local";
import { TokenService } from "token/token.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(
    Strategy,
    AUTH_STRATEGIES.LOCAL,
) {
    private logger = new Logger(LocalStrategy.name);
    constructor(
        private authService: AuthService,
        private tokenService: TokenService,
    ) {
        super({
            usernameField: "login",
            passwordField: "password",
        });
    }

    async validate(login: string, password: string) {
        this.logger.debug("||| Validating user...");
        const user = await this.authService.validateUser({ login, password });
        await this.tokenService.updateTokens(user);
        return user;
    }
}
