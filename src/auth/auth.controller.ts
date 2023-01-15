import {
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { ValidationPipe } from "pipes/validation.pipe";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import LoginDto from "./dto/login.dto";
import SignupDto from "./dto/signup.dto";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { LocalAuthGuard } from "./guards/local.guard";

@Controller("auth")
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
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
    @LocalAuthGuard()
    @Post("login")
    login(@Body(new ValidationPipe()) loginDto: LoginDto, @Req() req: Request) {
        return req.user;
    }

    @Public()
    @JwtAuthGuard()
    @Post("logout")
    logout(@Req() req: Request) {
        return req.user;
        // return this.authService.logout();
    }

    @Public()
    @Post("signup")
    signup(@Body(new ValidationPipe()) signupDto: SignupDto) {
        return this.authService.signup(signupDto);
    }
}
