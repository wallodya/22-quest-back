import { Controller, Post } from "@nestjs/common";

@Controller("auth")
export class AuthController {
    @Post("login")
    login() {
        return;
    }
    @Post("register")
    register() {
        return;
    }
}
