import { applyDecorators, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "auth/strategies/localAuth.strategy";

export const localAuthGuard = () => {
    return applyDecorators(UseGuards(LocalAuthGuard));
};
