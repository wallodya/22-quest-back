import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { Person } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { UserService } from "../user/user.service";
import { v4 as uuidv4 } from "uuid";
import LoginDto from "./dto/loginDto";
import RegisterDto from "./dto/registerDto";
import { JwtService } from "@nestjs/jwt";
import { UserPublic } from "types/user";

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
    constructor(
        private userServive: UserService,
        private jwtService: JwtService,
    ) {}

    async login(user: UserPublic) {
        return {
            access_token: this.generateToken(user),
        };
    }

    async logout() {
        return;
    }

    async register(dto: RegisterDto) {
        const isLoginTaken = !!(await this.userServive.getUserByLogin(
            dto.login,
        ));
        const isEmailTaken = !!(await this.userServive.getUserByEmail(
            dto.email,
        ));

        if (isLoginTaken) {
            throw new HttpException(
                "User with this login already exists",
                HttpStatus.BAD_REQUEST,
            );
        }

        if (isEmailTaken) {
            throw new HttpException(
                "User with this email already exists",
                HttpStatus.BAD_REQUEST,
            );
        }

        const hashedPassword = await bcrypt.hash(dto.password, 5);
        const uuid = uuidv4();

        const newUser = await this.userServive.createUser({
            ...dto,
            password: hashedPassword,
            uuid: uuid,
        });

        return this.generateToken(newUser);
    }

    async refresh(token: string) {
        return;
    }

    async activateEmail(code: string) {
        return;
    }

    async validateUser(dto: LoginDto): Promise<UserPublic> {
        const user = await this.userServive.getUserByEmail(dto.email);
        const isPasswordCorrect = await bcrypt.compare(
            dto.password,
            user.password,
        );

        if (user && isPasswordCorrect) {
            delete user.password;
            return user;
        }

        return null;
    }

    private async generateToken(user: UserPublic) {
        return this.jwtService.sign(user);
    }
}
