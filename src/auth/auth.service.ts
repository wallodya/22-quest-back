import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { TokenService } from "token/token.service";
import { UserPublic } from "user/types/user";
import { v4 as uuidv4 } from "uuid";
import { UserService } from "../user/user.service";
import LoginDto from "./dto/login.dto";
import SignupDto from "./dto/signup.dto";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        private userServive: UserService,
        private tokenSerice: TokenService,
    ) {}

    async logout() {
        this.logger.debug("||| Closing session...");
        const refreshToken = this.tokenSerice.getRefreshToken();
        this.logger.log("refreshToken: ", refreshToken);
        if (!refreshToken) {
            return;
        }
        try {
            await this.tokenSerice.removeToken(refreshToken);
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
            this.logger.verbose("Login is taken");
            this.logger.debug("||| User was not created");
            throw new BadRequestException(
                "User with this login already exists",
            );
        }

        if (isEmailTaken) {
            this.logger.verbose("E-mail is taken");
            this.logger.debug("||| User was not created");
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
        await this.tokenSerice.updateTokens(newUser);
        this.logger.debug("||| New user created");
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
