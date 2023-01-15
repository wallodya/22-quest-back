import { Body, Controller, Delete, Logger, Param, Post } from "@nestjs/common";
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

    @Delete(":roleName")
    deleteRole(@Param() { roleName }: { roleName: RoleEnum }) {
        return this.roleService.deleteRole(roleName);
    }
}
