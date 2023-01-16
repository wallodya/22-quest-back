import { RoleEnum } from "@prisma/client";
import { IsString, MaxLength, MinLength } from "class-validator";

export class AssignRoleDto {
    @IsString()
    @MinLength(3, { message: "Role name needs to be longer than 4 letters" })
    @MaxLength(20, { message: "Role name needs to be longer than 4 letters" })
    readonly roleName: RoleEnum;

    @IsString({ message: "Login has to be a string" })
    @MinLength(4, { message: "Login needs to have at least 4 symbols" })
    @MaxLength(20, { message: "Login cannot have more than 20 symbols" })
    readonly login: string;
}
