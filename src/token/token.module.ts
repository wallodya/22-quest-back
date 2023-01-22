import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RequestContextModule } from "nestjs-request-context";
import { PrismaService } from "prisma.service";
import { UserModule } from "user/user.module";
import { TokenConst } from "./const/token.const";
import { TokenService } from "./token.service";

@Module({
    providers: [TokenService, PrismaService, TokenConst],
    exports: [TokenService, TokenConst],
    imports: [JwtModule, RequestContextModule, UserModule],
})
export class TokenModule {}
