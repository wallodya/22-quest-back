import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AUTH_STRATEGIES } from "auth/const/auth.const";

class LocalAuth extends AuthGuard(AUTH_STRATEGIES.LOCAL) {}

export const LocalAuthGuard = () => applyDecorators(UseGuards(LocalAuth));
