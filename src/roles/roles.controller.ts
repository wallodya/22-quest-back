import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { SignedInGuard } from "auth/guards/signedIn.guard";
import { ValidationPipe } from "pipes/validation.pipe";
import { AssignRoleDto } from "./dto/assignRole.dto";
import { CreateRoleDto } from "./dto/createRole.dto";
import { RolesService } from "./roles.service";

@SignedInGuard()
@Controller("roles")
export class RolesController {
    private readonly logger = new Logger(RolesController.name);
    constructor(private roleService: RolesService) {}

    @Get()
    getAll() {
        return this.roleService.getAll();
    }

    @Post()
    createRole(@Body(new ValidationPipe()) createRoleDto: CreateRoleDto) {
        return this.roleService.createRole(createRoleDto);
    }

    @Post("assign")
    assignRole(@Body(new ValidationPipe()) assignRoleDto: AssignRoleDto) {
        return this.roleService.assignRole(assignRoleDto);
    }

    @Post("unassign")
    unnassignRole(@Body(new ValidationPipe()) unassignnRoleDto: AssignRoleDto) {
        return this.roleService.unassignRole(unassignnRoleDto);
    }

    @Patch()
    updateRole(@Body(new ValidationPipe()) updateRoleDto: CreateRoleDto) {
        return this.roleService.updateRole(updateRoleDto);
    }

    @Delete(":roleName")
    deleteRole(@Param() { roleName }: { roleName: RoleEnum }) {
        return this.roleService.deleteRole(roleName);
    }
}
