import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Prisma } from "@prisma/client";
import { REFRESH_TOKEN_NAME } from "auth/const/jwtConstants";
import * as bcrypt from "bcrypt";
import { RequestContext } from "nestjs-request-context";
import { PrismaService } from "prisma.service";
import { UserPublic } from "types/user";
import { UserService } from "user/user.service";
import { v4 as uuidv4 } from "uuid";
import {
    ACCESS_TOKEN_EXPIRATION,
    ACCESS_TOKEN_SECRET,
    bcryptTokenHashSalt,
    REFRESH_TOKEN_EXPIRATION,
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

    private decodeToken(token: string) {
        return this.jwtService.decode(token);
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
            const timouts = this.schedulerRegistry.getTimeouts();
            this.logger.log("All timeouts: ");
            this.logger.log(timouts);
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

        const tokenData = { ...tokenArgs, refreshToken: hashedToken };
        this.logger.log("Hashed token: ", hashedToken);
        this.logger.log("Token data:\n", tokenData);

        this.logger.verbose("Setting cookies...");
        const request = RequestContext.currentContext.req;
        request.cookies[REFRESH_TOKEN_NAME] = tokenArgs.refreshToken;
        const response = RequestContext.currentContext.res;
        const MS_IN_A_DAY = 1000 * 60 * 60 * 24;
        response.cookie(REFRESH_TOKEN_NAME, tokenArgs.refreshToken, {
            httpOnly: true,
            expires: true,
            maxAge: MS_IN_A_DAY,
        });

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

        if (request.url.split("/").pop() !== "logout") {
            this.setRefreshTokenExpriration({
                expiresIn: 20000,
                refreshToken: tokenArgs.refreshToken,
            });
        }
        return session.refreshToken;
    }
}
