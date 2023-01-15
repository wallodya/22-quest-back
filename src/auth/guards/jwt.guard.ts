import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AUTH_STRATEGIES } from "auth/const/auth.const";

class JwtAuth extends AuthGuard(AUTH_STRATEGIES.JWT) {}

export const JwtAuthGuard = () => applyDecorators(UseGuards(JwtAuth));
