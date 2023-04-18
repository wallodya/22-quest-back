import {
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Person } from "@prisma/client";
import { AUTH_STRATEGIES, IS_PUBLIC_METADATA_KEY } from "auth/const/auth.const";
import { UserSessions } from "auth/types/auth.types";
import { RolesService } from "roles/roles.service";
import { TokenService } from "token/token.service";
import { UserPublic } from "user/types/user";

@Injectable()
export class JwtAuthGuard extends AuthGuard(AUTH_STRATEGIES.JWT) {
    private readonly logger = new Logger(JwtAuthGuard.name);
    constructor(
        private tokenService: TokenService,
        private rolesService: RolesService,
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
            this.logger.log("Access token: ", accessToken);
            if (this.validateAccessToken(accessToken)) {
                const user = this.tokenService.decodeToken(accessToken)
                    .sub as UserSessions;
                await this.attachUser(context, user);
                return true;
            }
        } catch (err) {
            this.logger.warn("Error while validating access token: ", err);
        }

        this.logger.verbose("Access token is not valid");

        const refreshToken = this.tokenService.getRefreshToken();
        try {
            this.logger.verbose("Checking refresh token...");

            this.logger.log("refresh token: ", refreshToken);
            if (!refreshToken)
                throw new UnauthorizedException("Refresh token is not set");

            const userData: UserSessions = await this.getUserTokenData(
                refreshToken,
            );

            this.logger.log("Access-Token data: ", userData);
            await this.tokenService.updateTokens(userData);

            await this.attachUser(context, userData);

            this.logger.debug("||| Token verification success");
            return true;
        } catch (err) {
            this.logger.warn("Error while validating refresh token", err);
            this.tokenService.clearTokens();
            this.tokenService.removeToken(refreshToken);
            this.logger.debug("||| Token verification fail");
            return false;
        }
    }

    private async attachUser(
        context: ExecutionContext,
        userData: UserSessions,
    ) {
        const req = context.switchToHttp().getRequest();
        const user = this.clearPrivateFields(userData);
        req.user = await this.attachRoles(user);
        return;
    }

    private async attachRoles(userWORoles: UserPublic) {
        const roles = await this.rolesService.getUserRoles(userWORoles.uuid);
        return { ...userWORoles, roles };
    }

    private clearPrivateFields(user: UserSessions): UserPublic {
        delete user.user_id;
        delete user.password;
        delete user.tokens;
        return user;
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
