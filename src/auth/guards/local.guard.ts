import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AUTH_STRATEGIES } from "auth/const/auth.const";

@Injectable()
export class LocalAuthGuard extends AuthGuard(AUTH_STRATEGIES.LOCAL) {}
