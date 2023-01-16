import {
    BadRequestException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma, RoleEnum } from "@prisma/client";
import { User } from "user/types/user";
import { PrismaService } from "../prisma.service";
import { UserPrivateSelectFields } from "./const/user.const";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(private prismaService: PrismaService) {}

    async getAllUsers() {
        this.logger.debug("||| Gettinng list of all users...");
        const users = await this.prismaService.person.findMany();
        return users;
    }

    async getUserByLogin(login: string): Promise<User> {
        const user = await this.prismaService.person.findFirst({
            where: { login: login },
            select: UserPrivateSelectFields,
        });

        if (!user) {
            return null;
        }

        return user;
    }
    async getUserByEmail(email: string): Promise<User> {
        const user = await this.prismaService.person.findFirst({
            where: { email: email },
            select: UserPrivateSelectFields,
        });

        if (!user) {
            return null;
        }

        return user;
    }
    async getUserByUUID(uuid: string): Promise<User> {
        const user = await this.prismaService.person.findUnique({
            where: { uuid: uuid },
            select: UserPrivateSelectFields,
        });

        if (!user) {
            return null;
        }

        return user;
    }

    async getUserSessions(uuid: string) {
        const sessions = this.prismaService.person.findFirst({
            where: {
                uuid: uuid,
            },
            include: {
                tokens: {
                    select: {
                        refreshToken: true,
                        token_id: true,
                    },
                },
            },
        });
        return sessions;
    }

    async createUser(candidate: Prisma.PersonCreateInput) {
        this.logger.debug("||| Creating user...");
        try {
            const user = await this.prismaService.person.create({
                data: candidate,
            });
            const ownerLogin = "wallodya";
            await this.prismaService.rolesOnUsers.create({
                data: {
                    role: {
                        connect: {
                            name: RoleEnum.USER,
                        },
                    },
                    user: {
                        connect: {
                            user_id: user.user_id,
                        },
                    },
                    assignedBy: {
                        connect: {
                            login: ownerLogin,
                        },
                    },
                },
            });
            return user;
        } catch (err) {
            this.logger.error("Error in createUser:");
            this.logger.error(err);
            throw new ServiceUnavailableException("Couldn't create a user");
        }
    }

    async deleteUser(uuid: string) {
        this.logger.debug("||| Deleting user...");
        const candidate = await this.prismaService.person.findFirst({
            where: {
                uuid: uuid,
            },
        });
        if (!candidate) {
            throw new BadRequestException(
                `User with uuid "${uuid}" doesn't exists`,
            );
        }
        try {
            return this.prismaService.person.delete({
                where: {
                    uuid: uuid,
                },
            });
        } catch (err) {
            this.logger.error("Error in deleteUser:");
            this.logger.error(err);
            throw new ServiceUnavailableException("Couldn't delete a user");
        }
    }
}
