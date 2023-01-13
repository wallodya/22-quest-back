import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { TokenService } from "token/token.service";
import { UserPublic } from "types/user";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "../user/user.service";
import LoginDto from "./dto/loginDto";
import SignupDto from "./dto/signupDto";
import { Request } from "express";
import { REFRESH_TOKEN_NAME } from "./const/jwtConstants";

@Injectable()
export class AuthService {
    constructor(
        private userServive: UserService,
        private tokenSerice: TokenService,
    ) {}

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto);
        const tokens = await this.tokenSerice.updateTokens(user);
        return tokens;
    }

    async logout(req: Request) {
        const refreshToken = req.cookies[REFRESH_TOKEN_NAME];
        try {
            this.tokenSerice.removeToken(refreshToken);
        } catch (err) {
            Logger.warn(err);
            throw new BadRequestException("Could not delete token");
        }
        return "logged out";
    }

    async signup(dto: SignupDto) {
        const isLoginTaken = !!(await this.userServive.getUserByLogin(
            dto.login,
        ));
        const isEmailTaken = !!(await this.userServive.getUserByEmail(
            dto.email,
        ));

        if (isLoginTaken) {
            throw new BadRequestException(
                "User with this login already exists",
            );
        }

        if (isEmailTaken) {
            throw new BadRequestException(
                "User with this email already exists",
            );
        }

        const hashedPassword = await bcrypt.hash(dto.password, 5);
        const uuid = uuidv4();

        const { password, user_id, ...newUser } =
            await this.userServive.createUser({
                ...dto,
                password: hashedPassword,
                uuid: uuid,
            });
        const tokens = await this.tokenSerice.updateTokens(newUser);
        return tokens;
    }

    async refresh(token: string) {
        return;
    }

    async activateEmail(code: string) {
        return;
    }

    async validateUser(dto: LoginDto): Promise<UserPublic> {
        const user = await this.userServive.getUserByLogin(dto.login);
        if (!user) {
            throw new BadRequestException("Wrong login or password");
        }
        const isPasswordCorrect = await bcrypt.compare(
            dto.password,
            user.password,
        );

        if (!isPasswordCorrect) {
            throw new BadRequestException("Wrong login or password");
        }

        delete user.password;
        return user;
    }
}
