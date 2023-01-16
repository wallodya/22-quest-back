import { applyDecorators, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "auth/guards/local.guard";

export const UseLocalAuth = () => applyDecorators(UseGuards(LocalAuthGuard));
