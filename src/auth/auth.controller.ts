import {
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    Req,
} from "@nestjs/common";
import { Request } from "express";
import { ValidationPipe } from "pipes/validation.pipe";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import { UseLocalAuth } from "./decorators/useLocalAuth.decorator";
import SignupDto from "./dto/signup.dto";

@Controller("auth")
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(private authService: AuthService) {}

    @Get("activate/:confirmCode")
    activateEmail(@Param() confirmCode: string) {
        return this.authService.activateEmail(confirmCode);
    }

    @Public()
    @UseLocalAuth()
    @Post("login")
    login(@Req() req: Request) {
        return req.user;
    }

    @Post("logout")
    logout() {
        return this.authService.logout();
    }

    @Public()
    @Post("signup")
    signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }
}
