import { Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AUTH_STRATEGIES, JWT_SECRET } from "auth/const/auth.const";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    AUTH_STRATEGIES.JWT,
) {
    private logger = new Logger(JwtStrategy.name);
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
    }

    async validate(payload: any) {
        this.logger.log("Jwt strategy validate called with papyload: ");
        this.logger.log(payload);
        return payload;
    }
}
