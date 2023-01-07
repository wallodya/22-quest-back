import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { secret } from "./jwtConstants";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        UserModule,
        JwtModule.register({
            secret: secret,
            signOptions: {
                expiresIn: "60s",
            },
        }),
    ],
})
export class AuthModule {}
