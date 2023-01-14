import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { TokenService } from "token/token.service";
import { UserPublic } from "types/user";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "../user/user.service";
import LoginDto from "./dto/loginDto";
import SignupDto from "./dto/signupDto";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private userServive: UserService,
        private tokenSerice: TokenService,
    ) {}

    async login(dto: LoginDto) {
        const user = await this.validateUser(dto);
        const tokens = await this.tokenSerice.updateTokens(user);
        return tokens;
    }

    async logout() {
        this.logger.debug("||| Closing session...");
        const refreshToken = this.tokenSerice.getRefreshToken();
        try {
            this.tokenSerice.removeToken(refreshToken);
            this.tokenSerice.clearTokens();
        } catch (err) {
            this.logger.warn(err);
            throw new BadRequestException("Could not delete token");
        }
        this.logger.debug("||| Session closed");
        return;
    }

    async signup(dto: SignupDto) {
        this.logger.debug("||| Signing up new user...");
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
        this.logger.debug("||| New user created");
        return tokens;
    }

    async refresh(token: string) {
        return;
    }

    async activateEmail(code: string) {
        return;
    }

    async validateUser(dto: LoginDto): Promise<UserPublic> {
        this.logger.debug("||| Validating user...");
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

        this.logger.debug("||| User validated");
        delete user.password;
        return user;
    }
}
