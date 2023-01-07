import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import { UserPublic } from "types/user";
import { AuthService } from "./auth.service";
import LoginDto from "./dto/loginDto";
import RegisterDto from "./dto/registerDto";
import { LocalAuthGuard } from "./localAuth.guard";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}
    @Get("refresh")
    refreshToken(@Headers("Authentication") token: string) {
        return this.authService.refresh(token);
    }

    @Get("activate/:confirmCode")
    activateEmail(@Param() confirmCode: string) {
        return this.authService.activateEmail(confirmCode);
    }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    async login(@Request() req: UserPublic) {
        return this.authService.login(req);
    }

    @Post("logout")
    logout() {
        return this.authService.logout();
    }

    @Post("register")
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }
}
