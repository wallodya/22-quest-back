import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import LoginDto from "./dto/loginDto";
import RegisterDto from "./dto/registerDto";

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

    @Post("login")
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
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
