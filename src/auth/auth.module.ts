import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RequestContextModule } from "nestjs-request-context";
import { TokenModule } from "token/token.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { secret } from "./const/jwtConstants";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [UserModule, TokenModule, JwtModule.register({})],
})
export class AuthModule {}
