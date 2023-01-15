import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { ROLES_METADATA_KEY } from "roles/const/roles.const";

export const Roles = (...roles: RoleEnum[]) =>
    SetMetadata(ROLES_METADATA_KEY, roles);
