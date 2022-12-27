import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";

const fieldsToSelect = {
    uuid: true,
    login: true,
    email: true,
    isEmailConfirmed: true,
    dateOfBirth: true,
    createdAt: true,
    updatedAt: true,
};

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async getAllUsers() {
        const users = await this.prismaService.person.findMany();
        return users;
    }

    async getUserByLogin(login: string) {
        const user = await this.prismaService.person.findUnique({
            where: { login: login },
            select: fieldsToSelect,
        });

        if (!user) {
            throw new HttpException(
                "User with this login doesn't exist found",
                HttpStatus.NOT_FOUND,
            );
        }

        return user;
    }
    async getUserByEmail(email: string) {
        const user = await this.prismaService.person.findUnique({
            where: { email: email },
            select: fieldsToSelect,
        });

        if (!user) {
            throw new HttpException(
                "User with this login doesn't exist found",
                HttpStatus.NOT_FOUND,
            );
        }

        return user;
    }
    async getUserByUUID(uuid: string) {
        const user = await this.prismaService.person.findUnique({
            where: { uuid: uuid },
            select: fieldsToSelect,
        });

        if (!user) {
            throw new HttpException(
                "User with this login doesn't exist found",
                HttpStatus.NOT_FOUND,
            );
        }

        return user;
    }

    async createUser(candidate: Prisma.PersonCreateInput) {
        return;
    }

    async deleteUser(uuid: string, login: string) {
        return;
    }
}
