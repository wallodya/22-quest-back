import {
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { ExtractJwt } from "passport-jwt";
import { TokenService } from "token/token.service";
import { REFRESH_TOKEN_NAME } from "./const/jwtConstants";

@Injectable()
export class LocalAuthGuard extends AuthGuard("jwt") {
    private readonly logger = new Logger(LocalAuthGuard.name);
    constructor(private tokenService: TokenService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const res: Response = context.switchToHttp().getResponse();
        try {
            const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
            if (accessToken) {
                this.logger.debug("Access token exists");
                const isAccesTokenValid =
                    this.tokenService.validateToken(accessToken);
                if (isAccesTokenValid) {
                    this.logger.debug("access token is valid");
                    return true;
                }
            }

            this.logger.verbose("Access token is not valid");
            this.logger.verbose("Checking refresh token...");

            const refreshToken = req.cookies[REFRESH_TOKEN_NAME];
            if (!refreshToken)
                throw new UnauthorizedException("Refresh token is not set");

            const user = await this.tokenService.getUserFromRefreshToken(
                refreshToken,
            );
            if (!user)
                throw new UnauthorizedException("Refresh token is not valid");

            this.logger.log("User from token:\n", user);
            await this.tokenService.updateTokens(user);
            return true;
        } catch (err) {
            this.logger.warn(err);
            res.clearCookie(REFRESH_TOKEN_NAME);
            return false;
        }
    }
}
