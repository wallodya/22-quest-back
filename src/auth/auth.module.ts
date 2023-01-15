import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TokenModule } from "token/token.module";
import { TokenService } from "token/token.service";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [UserModule, TokenModule, JwtModule.register({})],
})
export class AuthModule {}
