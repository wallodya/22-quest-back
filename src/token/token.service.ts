import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, Token } from "@prisma/client";
import { REFRESH_TOKEN_NAME } from "auth/const/jwtConstants";
import * as bcrypt from "bcrypt";
import { RequestContext } from "nestjs-request-context";
import { PrismaService } from "prisma.service";
import { UserPublic } from "types/user";
import { UserPublicSelectFields } from "user/const/user.const";
import { v4 as uuidv4 } from "uuid";
import {
    ACCESS_TOKEN_EXPIRATION,
    ACCESS_TOKEN_SECRET,
    bcryptTokenHashSalt,
    REFRESH_TOKEN_EXPIRATION,
    REFRESH_TOKEN_SECRET,
} from "./const/token.const";
import { JwtToken, RefreshToken } from "./types/token.types";

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);
    constructor(
        private jwtService: JwtService,
        private prismaSerice: PrismaService,
    ) {}

    async updateTokens(user: UserPublic) {
        const { accessToken, refreshToken } = await this.generateTokens(user);
        const { ip, headers } = RequestContext.currentContext.req;
        await this.updateRefreshTokens({
            userAgent: headers["user-agent"],
            ip,
            refreshToken,
            user: {
                connect: {
                    uuid: user.uuid,
                },
            },
        });
        return {
            access_token: accessToken,
        };
    }

    validateToken(token: string) {
        this.logger.verbose("Validating token...");

        const decodedToken = this.decodeToken(token) as JwtToken;
        const expTime = new Date(decodedToken.exp * 1000);
        const currentTime = new Date(Date.now());

        this.logger.log("Token expiration time: ", expTime);
        this.logger.log("Current time: ", currentTime);

        if (currentTime >= expTime) {
            this.logger.warn("Token is expired");
            return false;
        }

        this.logger.verbose("Token is valid");
        return true;
    }

    async getUserFromRefreshToken(refreshToken: string) {
        this.logger.verbose("Validating refresh token...");

        const isValidToken = this.validateToken(refreshToken);
        if (!isValidToken) {
            this.logger.warn("Refresh token is not valid");
            return false;
        }

        const {
            sub: { uuid, token },
        } = this.decodeToken(refreshToken) as RefreshToken;

        this.logger.verbose("Looking for users sessions...");
        const tokenSessions = await this.prismaSerice.person.findMany({
            where: {
                uuid: uuid,
            },
            include: {
                tokens: {
                    select: {
                        refreshToken: true,
                    },
                },
            },
        });

        if (tokenSessions.length === 0) {
            this.logger.warn("Token owner doesn't have open sessions");
            return false;
        }

        this.logger.verbose("Session found:\n", tokenSessions);
        return tokenSessions.pop();
    }

    private decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

    private async generateTokens(user: UserPublic) {
        this.logger.verbose("Generating tokens...");
        const accessTokenPayload = {
            sub: user,
        };
        const refreshTokenPayload = {
            sub: {
                uuid: user.uuid,
                token: uuidv4(),
            },
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(accessTokenPayload, {
                secret: ACCESS_TOKEN_SECRET,
                expiresIn: ACCESS_TOKEN_EXPIRATION,
            }),
            this.jwtService.signAsync(refreshTokenPayload, {
                secret: REFRESH_TOKEN_SECRET,
                expiresIn: REFRESH_TOKEN_EXPIRATION,
            }),
        ]);
        this.logger.verbose("Access and refresh tokens are generated");
        return {
            accessToken,
            refreshToken,
        };
    }

    private async updateRefreshTokens(tokenArgs: Prisma.TokenCreateInput) {
        this.logger.verbose("Updating refresh token...");
        const hashedToken = await bcrypt.hash(
            tokenArgs.refreshToken,
            bcryptTokenHashSalt,
        );

        const tokenData = { refreshToken: hashedToken, ...tokenArgs };
        this.logger.log("Token data:\n", tokenData);

        this.logger.verbose("Setting cookies...");
        const request = RequestContext.currentContext.req;
        request.cookies[REFRESH_TOKEN_NAME] = tokenArgs.refreshToken;
        const response = RequestContext.currentContext.res;
        response.cookie(REFRESH_TOKEN_NAME, tokenArgs.refreshToken, {
            httpOnly: true,
        });

        this.logger.verbose(
            "Looking for sessions of this user agent:\n",
            tokenArgs.userAgent,
            "\n...",
        );
        const userAgentSession = await this.prismaSerice.token.findFirst({
            where: { userAgent: tokenArgs.userAgent },
            include: { user: { select: { user_id: true } } },
        });

        if (userAgentSession) {
            this.logger.verbose(
                "User agent already has open session:\n",
                userAgentSession,
                "\nUpdating the session with new refresh token...",
            );
            return this.prismaSerice.token.update({
                where: {
                    userAgent: tokenArgs.userAgent,
                },
                data: tokenData,
                select: {
                    refreshToken: true,
                },
            });
        }
        this.logger.verbose(
            "User agent doesn't have open sessions\n",
            "Generating new session with refresh token...",
        );
        return this.prismaSerice.token.create({
            data: tokenData,
            select: { refreshToken: true },
        });
    }
}
