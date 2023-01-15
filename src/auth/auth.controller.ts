import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { ValidationPipe } from "pipes/validation.pipe";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import LoginDto from "./dto/login.dto";
import SignupDto from "./dto/signup.dto";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}
    // @Get("refresh")
    // refreshToken(@Headers("Authentication") token: string) {
    //     return this.authService.refresh(token);
    // }

    @Get("activate/:confirmCode")
    activateEmail(@Param() confirmCode: string) {
        return this.authService.activateEmail(confirmCode);
    }

    @Public()
    @Post("login")
    async login(
        @Body(new ValidationPipe()) loginDto: LoginDto,
        @Req() req: Request,
    ) {
        return this.authService.login(loginDto);
    }

    @Post("logout")
    logout() {
        return this.authService.logout();
    }

    @Public()
    @Post("signup")
    async signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }
}
