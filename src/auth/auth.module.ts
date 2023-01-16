import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { RolesModule } from "roles/roles.module";
import { TokenModule } from "token/token.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    imports: [
        UserModule,
        TokenModule,
        forwardRef(() => RolesModule),
        JwtModule.register({}),
    ],
})
export class AuthModule {}
