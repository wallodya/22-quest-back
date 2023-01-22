import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AUTH_STRATEGIES } from "auth/const/auth.const";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RolesService } from "roles/roles.service";
import { TokenConst } from "token/const/token.const";
import { UserPublicToken } from "token/types/token.types";

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    AUTH_STRATEGIES.JWT,
) {
    private logger = new Logger(JwtStrategy.name);
    constructor(
        private roleService: RolesService,
        private tokenConst: TokenConst,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: tokenConst.ACCESS_TOKEN_SECRET,
        });
    }

    async validate({ sub: user }: UserPublicToken) {
        const roles = await this.roleService.getUserRoles(user.uuid);
        return { ...user, roles };
    }
}
