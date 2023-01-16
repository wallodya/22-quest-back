import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Patch,
    Post,
    Query,
    Req,
} from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { Request } from "express";
import { ValidationPipe } from "pipes/validation.pipe";
import { Roles } from "roles/decorators/roles.decorator";
import { UserPublic } from "user/types/user";
import CreateTaskDto from "./dto/createTask.dto";
import { TaskService } from "./task.service";

@Roles(RoleEnum.USER)
@Controller("task")
export class TaskController {
    private readonly logger = new Logger(TaskController.name);
    constructor(private taskService: TaskService) {}

    @Roles(RoleEnum.ADMIN)
    @Get()
    getAll() {
        this.logger.log("Get all tasks");
        return;
    }

    @Post()
    createTask(
        @Body(new ValidationPipe()) dto: CreateTaskDto,
        @Req() req: Request,
    ) {
        const user = req.user as UserPublic;
        const data = { owner: user, ...dto } as unknown as CreateTaskDto & {
            owner: UserPublic;
        };
        return this.taskService.createTask(data);
    }

    @Patch("complete")
    completeTask(@Query("id") taskId: string) {
        this.logger.log("completeTask:");
        this.logger.log(taskId);
        return;
    }

    @Patch("archive")
    cancelTask(@Query("id") taskId: string) {
        this.logger.log("archiveTask:");
        this.logger.log(taskId);
        return;
    }

    @Delete()
    deleteTask(@Query("id") taskId: string) {
        this.logger.log("deleteTask:");
        this.logger.log(taskId);
        return;
    }
}
