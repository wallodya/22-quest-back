import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

class SignupDto {
    @IsString({ message: "Login has to be a string" })
    @MinLength(4, { message: "Login needs to have at least 4 symbols" })
    @MaxLength(20, { message: "Login cannot have more than 20 symbols" })
    readonly login: string;

    @IsString({ message: "Email has to be a string" })
    @IsEmail({}, { message: "Not an email" })
    @MaxLength(50, { message: "Email is too long" })
    readonly email: string;

    @IsString({ message: "Password needs to be a string" })
    @MinLength(4, { message: "Password needs to have at least 4 symbols" })
    @MaxLength(24, { message: "Password connot have more than 24 symbols" })
    readonly password: string;
}

export default SignupDto;
