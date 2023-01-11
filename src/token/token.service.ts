import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { RequestContext } from "nestjs-request-context";
import { PrismaService } from "prisma.service";
import { UserPublic } from "types/user";

@Injectable()
export class TokenService {
    constructor(
        private jwtService: JwtService,
        private prismaSerice: PrismaService,
    ) {}

    async updateTokens(user: UserPublic) {
        const { accessToken, refreshToken } = await this.generateTokens(user);
        const { ip, headers } = RequestContext.currentContext.req;
        this.updateRefreshTokens({
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

    private async generateTokens(user: UserPublic) {
        console.log("generating tokens...");
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(user, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: "60s",
            }),
            this.jwtService.signAsync(user, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: "1h",
            }),
        ]);
        return {
            accessToken,
            refreshToken,
        };
    }

    private async updateRefreshTokens(tokenArgs: Prisma.TokenCreateInput) {
        const hashedToken = await bcrypt.hash(tokenArgs.refreshToken, 5);
        const tokenData = { refreshToken: hashedToken, ...tokenArgs };
        const userAgentTokens = await this.prismaSerice.token.findMany({
            where: { userAgent: tokenArgs.userAgent },
            include: { user: { select: { user_id: true } } },
        });
        if (userAgentTokens.length > 0) {
            console.log("token exists");
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
        return this.prismaSerice.token.create({
            data: tokenData,
            select: { refreshToken: true },
        });
    }
}
