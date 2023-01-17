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
import { RoleEnum, TaskType, TaskTypeEnum } from "@prisma/client";
import { Request } from "express";
import { ValidationPipe } from "pipes/validation.pipe";
import { Roles } from "roles/decorators/roles.decorator";
import { UserPublic } from "user/types/user";
import CreateTaskDto from "./dto/createTask.dto";
import { CreateTaskTypeDto } from "./dto/createTaskType.dto";
import { TaskService } from "./task.service";

@Roles(RoleEnum.USER)
@Controller("task")
export class TaskController {
    private readonly logger = new Logger(TaskController.name);
    constructor(private taskService: TaskService) {}

    @Roles(RoleEnum.ADMIN)
    @Get()
    getAll() {
        return this.taskService.getAll();
    }

    @Post()
    createTask(
        @Body(new ValidationPipe()) dto: CreateTaskDto,
        @Req() req: Request,
    ) {
        return this.taskService.createTask({
            ...dto,
            user: req.user as UserPublic,
        });
    }

    @Patch("check")
    checkTask(@Query("id") taskId: string) {
        return this.taskService.checkTask(taskId);
    }

    @Patch("complete")
    completeTask(@Query("id") taskId: string) {
        return this.taskService.completeTask(taskId);
    }

    @Patch("fail")
    failTask(@Query("id") taskId: string) {
        return this.taskService.failTask(taskId);
    }

    @Delete()
    deleteTask(@Query("id") taskId: string) {
        return this.taskService.deleteTask(taskId);
    }

    @Roles(RoleEnum.ADMIN, RoleEnum.DEV)
    @Get("types")
    getTaskTypes(@Query("name", new ValidationPipe()) typeName: TaskTypeEnum) {
        if (typeName) {
            return this.taskService.getTaskType(typeName);
        } else {
            return this.taskService.getAllTaskTypes();
        }
    }

    @Post("types")
    createTaskType(@Body(new ValidationPipe()) dto: CreateTaskTypeDto) {
        return this.taskService.createTaskType(dto);
    }

    @Patch("types")
    updateTaskType(@Body(new ValidationPipe()) dto: CreateTaskTypeDto) {
        return this.taskService.updateTaskType(dto);
    }
}
