import {
    Body,
    Controller,
    Get,
    Headers,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { ValidationPipe } from "pipes/validation.pipe";
import { AuthService } from "./auth.service";
import LoginDto from "./dto/loginDto";
import SignupDto from "./dto/signupDto";
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

    @Post("login")
    async login(
        @Body(new ValidationPipe()) loginDto: LoginDto,
        @Req() req: Request,
    ) {
        return this.authService.login(loginDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post("logout")
    logout(@Req() req: Request) {
        return this.authService.logout(req);
    }

    @Post("signup")
    async signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }
}
