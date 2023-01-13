import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RequestContextModule } from "nestjs-request-context";
import { PrismaService } from "prisma.service";
import { UserModule } from "user/user.module";
import { TokenService } from "./token.service";

@Module({
    providers: [TokenService, PrismaService],
    exports: [TokenService],
    imports: [JwtModule, RequestContextModule, UserModule],
})
export class TokenModule {}
