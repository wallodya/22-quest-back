import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { RequestContext } from "nestjs-request-context";
import { PrismaService } from "prisma.service";
import { UserPublic } from "user/types/user";

export class TaskOwnerPipe implements PipeTransform<string, Promise<string>> {
    constructor(private prismaService: PrismaService) {}

    async transform(
        value: string,
        metadata: ArgumentMetadata,
    ): Promise<string> {
        const client: UserPublic & { roles: RoleEnum[] } =
            RequestContext.currentContext.req?.user;
        const clientRoles = client.roles;
        const isAdminOrOwner =
            clientRoles.includes(RoleEnum.ADMIN) ||
            clientRoles.includes(RoleEnum.OWNER);
        if (isAdminOrOwner) {
            return value;
        }
        return value;
    }
}
