import { RoleEnum } from "@prisma/client";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateRoleDto {
    @IsString()
    @MinLength(3, { message: "Role name needs to be longer than 4 letters" })
    @MaxLength(40, { message: "Role name needs to be longer than 4 letters" })
    readonly name: RoleEnum;

    @IsString()
    @MinLength(20, { message: "Role name needs to be longer than 4 letters" })
    @MaxLength(400, { message: "Role name needs to be longer than 4 letters" })
    readonly description: string;
}
