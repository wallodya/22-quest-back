import { Injectable } from "@nestjs/common";
import { Person } from "@prisma/client";
import LoginDto from "./dto/loginDto";
import RegisterDto from "./dto/registerDto";

const testUser = {
    uuid: "123",
    login: "User",
    email: "test@test.com",
    isEmailConfirmed: true,
    dateOfBirth: new Date("2001-02-01"),
    createdAt: new Date("2020-10-10"),
    updatedAt: new Date("2020-10-12"),
};

@Injectable()
export class AuthService {
    async login(dto: LoginDto) {
        const user = await this.validateUser(dto);
        return this.generateToken(user);
    }

    async logout() {
        return;
    }

    async register(dto: RegisterDto) {
        const user = testUser;
        return this.generateToken(user);
    }

    async refresh(token: string) {
        return;
    }

    async activateEmail(code: string) {
        return;
    }

    private async validateUser(dto: LoginDto) {
        return testUser;
    }

    private async generateToken(user: Omit<Person, "user_id" | "password">) {
        return { token: "testToken" };
    }
}
