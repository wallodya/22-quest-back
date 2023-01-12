import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Person, Prisma } from "@prisma/client";
import { User } from "types/user";
import { PrismaService } from "../prisma.service";
import { UserPrivateSelectFields } from "./const/user.const";

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async getAllUsers() {
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
