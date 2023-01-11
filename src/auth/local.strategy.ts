import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UserPublic } from "types/user";
import { AuthService } from "./auth.service";
import LoginDto from "./dto/loginDto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(dto: LoginDto) {
        console.log("validating user");
        const user: UserPublic = await this.authService.validateUser(dto);
        if (!user) {
            throw new UnauthorizedException("Wrong login or password");
        }
        return user;
    }
}
