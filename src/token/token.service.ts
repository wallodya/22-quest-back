import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { Response } from "express";
import { RequestContext } from "nestjs-request-context";
import { ExtractJwt } from "passport-jwt";
import { PrismaService } from "prisma.service";
import { UserPublic } from "user/types/user";
import { UserService } from "user/user.service";
import { v4 as uuidv4 } from "uuid";
import { TokenConst } from "./const/token.const";
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
        private tokenConst: TokenConst,
    ) {}

    async updateTokens(user: UserPublic) {
        const { accessToken, refreshToken } = await this.generateTokens(user);
        const { ip, headers: reqHeaders } = RequestContext.currentContext.req;
        const oldRefreshToken = this.getRefreshToken();
        await this.updateRefreshTokens({
            userAgent: reqHeaders["user-agent"],
            ip,
            oldRefreshToken,
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

    async getRefreshTokenOwner(refreshToken: string) {
        this.logger.verbose("Validating refresh token...");

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
        return {
            ...userSessions,
            tokens: userSessions.tokens.map((token) => token.refreshToken),
        };
    }

    async removeToken(refreshToken: string) {
        this.logger.verbose("Removing token...");
        // const {
        //     sub: { uuid },
        // } = this.decodeToken(refreshToken) as RefreshToken;
        const token = this.decodeToken(refreshToken) as RefreshToken;
        this.logger.log("token: ", token);
        const uuid = token?.sub?.uuid;
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
        const refreshToken =
            req.cookies[this.tokenConst.REFRESH_TOKEN_NAME] || null;
        this.logger.log("req.cookies", req.cookies);
        this.logger.log(
            "req.cookies refreshToken:",
            req.cookies[this.tokenConst.REFRESH_TOKEN_NAME],
        );
        return refreshToken;
    }

    getAccessToken() {
        const req = RequestContext.currentContext.req;
        const accessToken =
            ExtractJwt.fromAuthHeaderAsBearerToken()(req) ||
            ExtractJwt.fromHeader("authorization")(req);
        return accessToken;
    }

    clearTokens() {
        const { res } = RequestContext.currentContext;
        res.clearCookie(this.tokenConst.REFRESH_TOKEN_NAME);
        res.setHeader(this.tokenConst.ACCESS_TOKEN_HEADER_NAME, "");
        return;
    }

    decodeToken(token: string) {
        return this.jwtService.decode(token);
    }

    private setAccessTokenHeaders = (accessToken: string) => {
        const { headers: reqHeaders } = RequestContext.currentContext.req;
        const res = RequestContext.currentContext.res;
        reqHeaders[this.tokenConst.ACCESS_TOKEN_HEADER_NAME] =
            "Bearer " + accessToken;
        res.setHeader(
            this.tokenConst.ACCESS_TOKEN_HEADER_NAME,
            "Bearer " + accessToken,
        );
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
                secret: this.tokenConst.ACCESS_TOKEN_SECRET,
                expiresIn: this.tokenConst.ACCESS_TOKEN_EXPIRATION,
            }),
            this.jwtService.signAsync(refreshTokenPayload, {
                secret: this.tokenConst.REFRESH_TOKEN_SECRET,
                expiresIn: this.tokenConst.REFRESH_TOKEN_EXPIRATION,
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
        request.cookies[this.tokenConst.REFRESH_TOKEN_NAME] = refreshToken;
        const response = RequestContext.currentContext.res as Response;
        response.cookie(
            this.tokenConst.REFRESH_TOKEN_NAME,
            refreshToken,
            this.tokenConst.REFRESH_TOKEN_COOKIE_OPTIONS,
        );
        this.logger.log("Res cookies: ", response);
    }

    private updateRemoveRTTimeout(newRefreshToken: string) {
        this.logger.verbose("Updating remove Refresh-Token timeout...");
        const oldRefreshToken = this.getRefreshToken();
        if (oldRefreshToken) {
            try {
                this.schedulerRegistry.deleteTimeout(
                    getTokenExpTimeoutName(oldRefreshToken),
                );
            } catch (err) {
                this.logger.warn("Error in updateRemoveRTTimeout:");
                this.logger.warn(err);
            }
        }
        this.setRefreshTokenExpriration({
            expiresIn: this.tokenConst.REFRESH_TOKEN_EXPIRATION_MS,
            refreshToken: newRefreshToken,
        });
        return;
    }

    private async updateRefreshTokens(
        tokenArgs: Prisma.TokenCreateInput & { oldRefreshToken: string },
    ) {
        this.logger.verbose("Updating refresh token...");

        const newRefreshToken = tokenArgs.refreshToken;
        const hashedToken = await bcrypt.hash(
            newRefreshToken,
            this.tokenConst.bcryptTokenHashSalt,
        );

        const { oldRefreshToken, ...tokenData } = {
            ...tokenArgs,
            refreshToken: hashedToken,
        };

        this.logger.log("Hashed new token: ", hashedToken);
        this.logger.log("Refresh-Token data:\n", tokenData);

        this.logger.verbose(
            "Looking for sessions of this user agent:\n",
            tokenArgs.userAgent,
            "\n...",
        );
        const userAgentSession = await this.prismaService.token.findFirst({
            where: {
                AND: {
                    userAgent: tokenArgs.userAgent,
                    user: {
                        uuid: tokenArgs.user.connect.uuid,
                    },
                },
            },
            include: { user: { select: { user_id: true } } },
        });

        let session: UserSession;
        if (userAgentSession && oldRefreshToken) {
            this.logger.verbose(
                "User agent already has open session:\n",
                userAgentSession,
                "Updating the session with new refresh token...",
            );
            const hashedOldToken = await bcrypt.hash(
                oldRefreshToken,
                this.tokenConst.bcryptTokenHashSalt,
            );
            this.logger.log("Hashed old token: ", hashedOldToken);

            session = await this.prismaService.token.update({
                where: {
                    token_id: userAgentSession.token_id,
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
