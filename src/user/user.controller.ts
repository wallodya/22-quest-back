import { Controller, Delete, Get, Logger, Param, Query } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { Roles } from "roles/decorators/roles.decorator";
import { UserService } from "./user.service";

@Controller("user")
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(private userService: UserService) {}

    @Roles(RoleEnum.ADMIN)
    @Get()
    getAll() {
        return this.userService.getAllUsers();
    }

    @Roles(RoleEnum.ADMIN)
    @Delete()
    deleteUser(@Query("uuid") uuid: string) {
        return this.userService.deleteUser(uuid);
    }
}
