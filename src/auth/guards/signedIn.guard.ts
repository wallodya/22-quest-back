import { applyDecorators, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "auth/strategies/localAuth.strategy";

export const SignedInGuard = () => {
    return applyDecorators(UseGuards(LocalAuthGuard));
};
