import {
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_METADATA_KEY } from "auth/const/auth.const";
import { TokenService } from "token/token.service";

@Injectable()
export class LocalAuthGuard extends AuthGuard("jwt") {
    private readonly logger = new Logger(LocalAuthGuard.name);
    constructor(
        private tokenService: TokenService,
        private reflector: Reflector,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_METADATA_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            this.logger.debug("||| Route is puclic: no auth needed");
            return true;
        }

        this.logger.debug("||| Verifying tokens... ");
        try {
            this.logger.verbose("Checking access token...");
            const accessToken = this.tokenService.getAccessToken();
            if (this.validateAccessToken(accessToken)) {
                return true;
            }

            this.logger.verbose("Access token is not valid");
            this.logger.verbose("Checking refresh token...");

            const refreshToken = this.tokenService.getRefreshToken();
            if (!refreshToken)
                throw new UnauthorizedException("Refresh token is not set");

            const userData = await this.getUserTokenData(refreshToken);

            this.logger.log("Access-Token data: ", userData);
            await this.tokenService.updateTokens(userData);
            this.logger.debug("||| Token verification success");
            return true;
        } catch (err) {
            this.logger.warn(err);
            this.tokenService.clearTokens();
            this.logger.debug("||| Token verification fail");
            return false;
        }
    }

    private validateAccessToken(accessToken: string) {
        if (accessToken) {
            this.logger.debug("Access token exists");
            const isAccesTokenValid =
                this.tokenService.validateToken(accessToken);
            if (isAccesTokenValid) {
                this.logger.debug("access token is valid");
                this.logger.debug("||| Token verification success");
                return true;
            }
        } else {
            return false;
        }
    }

    private async getUserTokenData(refreshToken: string) {
        const tokenOwner = await this.tokenService.getRefreshTokenOwner(
            refreshToken,
        );
        if (!tokenOwner)
            throw new UnauthorizedException("Refresh token is not valid");
        return tokenOwner;
    }
}
