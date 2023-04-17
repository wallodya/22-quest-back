import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RoleEnum } from "@prisma/client";
import { ROLES_METADATA_KEY } from "roles/const/roles.const";

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        this.logger.debug("||| Authorizing user...");
        const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
            ROLES_METADATA_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) {
            this.logger.verbose("No roles required");
            this.logger.debug("||| Authorization success");
            return true;
        }
        const userRoles = context.switchToHttp().getRequest().user?.roles;
        if (userRoles?.includes(RoleEnum.OWNER)) {
            this.logger.verbose("User has OWNER access level");
            this.logger.debug("||| Authorization success");
            return true;
        }
        this.logger.verbose("Required roles:");
        this.logger.verbose(requiredRoles);
        this.logger.verbose("User roles:");
        this.logger.verbose(userRoles);
        const isAuthorized = requiredRoles.some((role) =>
            userRoles?.includes(role),
        );
        this.logger.debug(
            isAuthorized
                ? "||| Authorization success"
                : "||| Authorization fail",
        );
        return isAuthorized;
    }
}
