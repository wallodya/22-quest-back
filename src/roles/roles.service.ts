import {
    BadRequestException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma, RoleEnum } from "@prisma/client";
import { PrismaService } from "prisma.service";
import { UserService } from "user/user.service";
import { AssignRoleDto } from "./dto/assignRole.dto";
import { CreateRoleDto } from "./dto/createRole.dto";

@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);
    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
    ) {}

    async createRole(dto: CreateRoleDto) {
        this.logger.debug("||| Creating role...");
        const newRoleData: Prisma.RoleCreateInput = {
            updatedAt: new Date(Date.now()),
            ...dto,
        };

        try {
            await this.prismaService.role.create({
                data: newRoleData,
            });
            this.logger.debug("||| Role created...");
            return;
        } catch (err) {
            this.logger.debug("||| Role wasn't created");
            const roleFromDto = await this.getRoleByName(dto.name);
            if (roleFromDto) {
                throw new BadRequestException(
                    `Role ${dto.name} already exists`,
                );
            }
            this.logger.warn("Error in createRole:");
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }
    async assignRole(dto: AssignRoleDto) {
        this.logger.debug("||| Assigning role...");
        const assignedBy = "admin";
        const assignRoleData: Prisma.RolesOnUsersCreateInput = {
            user: {
                connect: {
                    login: dto.login,
                },
            },
            role: {
                connect: {
                    name: dto.roleName,
                },
            },
            assignedBy: {
                connect: {
                    login: assignedBy,
                },
            },
        };

        try {
            await this.prismaService.rolesOnUsers.create({
                data: assignRoleData,
            });
            this.logger.debug("||| Role assigned");
            return;
        } catch (err) {
            this.logger.debug("||| Role wasn't assigned");
            await this.checkRoleName(dto.roleName);
            await this.checkUser(dto.login);
            this.logger.warn("Error in assignRole:");
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async unassignRole(dto: AssignRoleDto) {
        this.logger.debug("||| Unassigning role");

        try {
            const { user_id: userId } = await this.userService.getUserByLogin(
                dto.login,
            );
            const { role_id: roleId } =
                await this.prismaService.role.findUnique({
                    where: { name: dto.roleName },
                    rejectOnNotFound: true,
                    select: {
                        role_id: true,
                    },
                });
            this.prismaService.rolesOnUsers.delete({
                where: {
                    user_role: {
                        userId,
                        roleId,
                    },
                },
            });
            this.logger.debug("||| Role unassigned");
        } catch (err) {
            this.logger.debug("||| Role wasn't unassignedc");
            this.checkRoleName(dto.roleName);
            this.checkUser(dto.login);
            this.logger.warn("Error in unassignRole:");
            this.logger.warn(err);
            throw new BadRequestException();
        }
    }

    async deleteRole(role: RoleEnum) {
        this.logger.debug("||| Deleting role...");
        const deleteRoleData = {
            name: role,
        };

        try {
            await this.prismaService.role.delete({
                where: deleteRoleData,
            });
            this.logger.debug("||| Role deleted...");
            return;
        } catch (err) {
            this.logger.debug("||| Role wasn't deleted");
            this.checkRoleName(role);
            this.logger.warn("Error in deleteRole:");
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    private async checkRoleName(roleName: RoleEnum) {
        const roleFromDto = await this.getRoleByName(roleName);
        if (!roleFromDto) {
            throw new BadRequestException(`Role ${roleName} doesn't exist`);
        }
        return;
    }

    private async checkUser(login: string) {
        const userFromDto = await this.userService.getUserByLogin(login);
        if (!userFromDto) {
            throw new BadRequestException(
                `User with login: ${login} doesn't exist`,
            );
        }
        return;
    }

    private async getRoleByName(roleName: RoleEnum) {
        const isEnum = Object.values(RoleEnum).includes(roleName);
        if (!isEnum) {
            throw new BadRequestException(
                `Role name ${roleName} not in RoleEnum`,
            );
        }
        const role = await this.prismaService.role.findFirst({
            where: {
                name: roleName,
            },
        });
        return role;
    }
}
