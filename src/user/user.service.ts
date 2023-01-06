import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Person, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";

const fieldsToSelect = {
    uuid: true,
    login: true,
    email: true,
    password: true,
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
        const user = await this.prismaService.person.findFirst({
            where: { login: login },
            select: fieldsToSelect,
        });

        if (!user) {
            return null;
        }

        return user;
    }
    async getUserByEmail(email: string) {
        const user = await this.prismaService.person.findFirst({
            where: { email: email },
            select: fieldsToSelect,
        });

        if (!user) {
            return null;
        }

        return user;
    }
    async getUserByUUID(uuid: string) {
        const user = await this.prismaService.person.findUnique({
            where: { uuid: uuid },
            select: fieldsToSelect,
        });

        if (!user) {
            return null;
        }

        return user;
    }

    async createUser(candidate: Prisma.PersonCreateInput) {
        return this.prismaService.person.create({ data: candidate });
    }

    async deleteUser({ uuid, login }: { uuid: string; login: string }) {
        return this.prismaService.person.delete({
            where: {
                uuid: uuid,
                login: login,
            },
        });
    }
}
