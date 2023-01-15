import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { ValidationPipe } from "pipes/validation.pipe";
import { Roles } from "./decorators/roles.decorator";
import { AssignRoleDto } from "./dto/assignRole.dto";
import { CreateRoleDto } from "./dto/createRole.dto";
import { RolesService } from "./roles.service";

@Controller("roles")
export class RolesController {
    constructor(private roleService: RolesService) {}

    @Roles(RoleEnum.ADMIN, RoleEnum.DEV)
    @Get()
    getAll() {
        return this.roleService.getAll();
    }

    @Roles(RoleEnum.ADMIN)
    @Get("users")
    getallUsersWithRoles() {
        return this.roleService.getAllUsersWithRoles();
    }

    @Roles(RoleEnum.DEV)
    @Post()
    createRole(@Body(new ValidationPipe()) createRoleDto: CreateRoleDto) {
        return this.roleService.createRole(createRoleDto);
    }

    @Roles(RoleEnum.ADMIN)
    @Post("assign")
    assignRole(@Body(new ValidationPipe()) assignRoleDto: AssignRoleDto) {
        return this.roleService.assignRole(assignRoleDto);
    }

    @Roles(RoleEnum.ADMIN)
    @Post("unassign")
    unnassignRole(@Body(new ValidationPipe()) unassignnRoleDto: AssignRoleDto) {
        return this.roleService.unassignRole(unassignnRoleDto);
    }

    @Roles(RoleEnum.DEV)
    @Patch()
    updateRole(@Body(new ValidationPipe()) updateRoleDto: CreateRoleDto) {
        return this.roleService.updateRole(updateRoleDto);
    }

    @Roles(RoleEnum.DEV)
    @Delete(":roleName")
    deleteRole(@Param() { roleName }: { roleName: RoleEnum }) {
        return this.roleService.deleteRole(roleName);
    }
}
