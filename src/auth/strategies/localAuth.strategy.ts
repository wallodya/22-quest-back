import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TokenService } from "token/token.service";

@Injectable()
export class LocalAuthGuard extends AuthGuard("jwt") {
    private readonly logger = new Logger(LocalAuthGuard.name);
    constructor(private tokenService: TokenService) {
        super();
    }

    async canActivate(): Promise<boolean> {
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
        const tokenOwner = await this.tokenService.getUserFromRefreshToken(
            refreshToken,
        );
        if (!tokenOwner)
            throw new UnauthorizedException("Refresh token is not valid");
        return tokenOwner;
    }
}
