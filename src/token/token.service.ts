import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RequestContext } from "nestjs-request-context";
import { ExtractJwt } from "passport-jwt";
import { PrismaService } from "prisma.service";
import { UserPublic } from "user/types/user";
import { UserService } from "user/user.service";
import { v4 as uuidv4 } from "uuid";
import {
    ACCESS_TOKEN_EXPIRATION,
    ACCESS_TOKEN_HEADER_NAME,
    ACCESS_TOKEN_SECRET,
    bcryptTokenHashSalt,
    REFRESH_TOKEN_COOKIE_OPTIONS,
    REFRESH_TOKEN_EXPIRATION,
    REFRESH_TOKEN_EXPIRATION_MS,
    REFRESH_TOKEN_NAME,
    REFRESH_TOKEN_SECRET,
} from "./const/token.const";
import {
    JwtToken,
    RefreshToken,
    SetRefreshTokenExpArgs,
    UserSession,
} from "./types/token.types";
import { getTokenExpTimeoutName } from "./utils/token.utils";

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private prismaService: PrismaService,
        private schedulerRegistry: SchedulerRegistry,
    ) {}

    async updateTokens(user: UserPublic) {
        const { accessToken, refreshToken } = await this.generateTokens(user);
        const { ip, headers: reqHeaders } = RequestContext.currentContext.req;
        await this.updateRefreshTokens({
            userAgent: reqHeaders["user-agent"],
            ip,
            refreshToken,
            user: {
                connect: {
                    uuid: user.uuid,
                },
            },
        });

        this.logger.verbose("Setting Authorization header...");
        this.setAccessTokenHeaders(accessToken);
        return;
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
        this.logger.log("Token:\n", refreshToken);

        const isValidToken = this.validateToken(refreshToken);
        if (!isValidToken) {
            this.logger.warn("Refresh token is not valid");
            return null;
        }

        const {
            sub: { uuid },
        } = this.decodeToken(refreshToken) as RefreshToken;

        this.logger.verbose("Looking for users sessions...");
        const userSessions = await this.prismaService.person.findFirst({
            where: {
                uuid: uuid,
            },
            include: {
                tokens: {
                    select: {
                        refreshToken: true,
                    },
                },
                roles: true,
            },
        });

        if (!userSessions) {
            this.logger.warn("Token owner doesn't have open sessions");
            return null;
        }

        this.logger.verbose("Comparing tokens...");
        const hasSessionWithToken = (
            await Promise.all(
                userSessions.tokens.map(
                    async (session) =>
                        await bcrypt.compare(
                            refreshToken,
                            session.refreshToken,
                        ),
                ),
            )
        ).some((isTokenCorrect: boolean) => isTokenCorrect);

        if (!hasSessionWithToken) {
            this.logger.warn("No matches found for the token");
            return null;
        }

        this.logger.verbose("Sessions found:\n", userSessions);
        return userSessions;
    }

    async removeToken(refreshToken: string) {
        this.logger.verbose("Removing token...");
        const {
            sub: { uuid },
        } = this.decodeToken(refreshToken) as RefreshToken;
        const sessions = await this.userService.getUserSessions(uuid);
        const validatedSessions = await Promise.all(
            sessions.tokens.map(async (session) => {
                const isForDelete = await bcrypt.compare(
                    refreshToken,
                    session.refreshToken,
                );
                return {
                    isForDelete,
                    tokenId: session.token_id,
                };
            }),
        );
        try {
            const { tokenId } = validatedSessions.find(
                (session) => session.isForDelete,
            );
            await this.prismaService.token.delete({
                where: {
                    token_id: tokenId,
                },
            });
            this.schedulerRegistry.deleteTimeout(
                getTokenExpTimeoutName(refreshToken),
            );
            return;
        } catch (err) {
            this.logger.warn("Error in removeToken:");
            this.logger.warn(err);
            return;
        }
    }

    setRefreshTokenExpriration({
        expiresIn,
        refreshToken,
    }: SetRefreshTokenExpArgs) {
        this.logger.verbose("Setting timout for refresh token removal...");

        const removeSessionCallback = async (token: string) => {
            await this.removeToken(token);
        };

        const timeout = setTimeout(() => {
            removeSessionCallback(refreshToken);
        }, expiresIn);
        const timeoutName = getTokenExpTimeoutName(refreshToken);
        this.schedulerRegistry.addTimeout(timeoutName, timeout);
    }

    getRefreshToken() {
        const req = RequestContext.currentContext.req;
        const refreshToken = req.cookies[REFRESH_TOKEN_NAME];
        return refreshToken;
    }

    getAccessToken() {
        const req = RequestContext.currentContext.req;
        const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        return accessToken;
    }

    clearTokens() {
        const { res } = RequestContext.currentContext;
        res.clearCookie(REFRESH_TOKEN_NAME);
        res.setHeader(ACCESS_TOKEN_HEADER_NAME, "");
        return;
    }

    private decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

    private setAccessTokenHeaders = (accessToken: string) => {
        const { headers: reqHeaders } = RequestContext.currentContext.req;
        const res = RequestContext.currentContext.res;
        reqHeaders[ACCESS_TOKEN_HEADER_NAME] = "Bearer " + accessToken;
        res.setHeader(ACCESS_TOKEN_HEADER_NAME, "Bearer " + accessToken);
        return;
    };

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

    private setRefreshCookies(refreshToken: string) {
        this.logger.verbose("Setting Refresh-Token cookie...");
        const request = RequestContext.currentContext.req;
        request.cookies[REFRESH_TOKEN_NAME] = refreshToken;
        const response = RequestContext.currentContext.res;
        response.cookie(
            REFRESH_TOKEN_NAME,
            refreshToken,
            REFRESH_TOKEN_COOKIE_OPTIONS,
        );
    }

    private updateRemoveRTTimeout(newRefreshToken: string) {
        this.logger.verbose("Updating remove Refresh-Token timeout...");
        const oldRefreshToken = this.getRefreshToken();
        try {
            this.schedulerRegistry.deleteTimeout(
                getTokenExpTimeoutName(oldRefreshToken),
            );
        } catch (err) {
            this.logger.warn("Error in updateRemoveRTTimeout:");
            this.logger.warn(err);
        }
        this.setRefreshTokenExpriration({
            expiresIn: REFRESH_TOKEN_EXPIRATION_MS,
            refreshToken: newRefreshToken,
        });
        return;
    }

    private async updateRefreshTokens(tokenArgs: Prisma.TokenCreateInput) {
        this.logger.verbose("Updating refresh token...");

        const newRefreshToken = tokenArgs.refreshToken;
        const hashedToken = await bcrypt.hash(
            newRefreshToken,
            bcryptTokenHashSalt,
        );

        const tokenData = { ...tokenArgs, refreshToken: hashedToken };
        this.logger.log("Hashed token: ", hashedToken);
        this.logger.log("Refresh-Token data:\n", tokenData);

        this.logger.verbose(
            "Looking for sessions of this user agent:\n",
            tokenArgs.userAgent,
            "\n...",
        );
        const userAgentSession = await this.prismaService.token.findFirst({
            where: { userAgent: tokenArgs.userAgent },
            include: { user: { select: { user_id: true } } },
        });

        let session: UserSession;
        if (userAgentSession) {
            this.logger.verbose(
                "User agent already has open session:\n",
                userAgentSession,
                "Updating the session with new refresh token...",
            );
            session = await this.prismaService.token.update({
                where: {
                    userAgent: tokenArgs.userAgent,
                },
                data: tokenData,
            });
        } else {
            this.logger.verbose(
                "User agent doesn't have open sessions\n",
                "Generating new session with refresh token...",
            );
            session = await this.prismaService.token.create({
                data: tokenData,
            });
        }

        this.updateRemoveRTTimeout(newRefreshToken);

        this.setRefreshCookies(newRefreshToken);

        return session.refreshToken;
    }
}
