import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "auth/guards/jwt.guard";

export const UseJwtAuth = () => applyDecorators(UseGuards(JwtAuthGuard));
