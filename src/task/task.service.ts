import {
    BadRequestException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "prisma.service";
import { UserPublic } from "user/types/user";
import { UserService } from "user/user.service";
import CreateTaskDto from "./dto/createTask.dto";

@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
    ) {}

    async createTask(taskData: CreateTaskDto & { owner: UserPublic }) {
        this.logger.log("taskData:");
        this.logger.log(taskData);
        this.logger.log("owner:");
        this.logger.log(taskData.owner);
        return;
    }

    async cancelTask() {
        return;
    }

    async completeTask(taskId: string) {
        this.logger.debug("||| Marking task as completed...");
        try {
            await this.prismaService.task.update({
                where: { uniqueTaskId: taskId },
                data: { isCompleted: true },
            });
            this.logger.debug("||| Task marked as completed");
            return;
        } catch (err) {
            this.logger.warn("||| Task wasn't marked as completed");
            const task = await this.prismaService.task.findFirst({
                where: { uniqueTaskId: taskId },
            });
            if (!task) {
                this.logger.log("Task doesn't exist");
                throw new BadRequestException(
                    `Task with id "${taskId}" doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async deleteTask(taskId: string) {
        this.logger.debug("||| Deleting task...");
        try {
            await this.prismaService.task.delete({
                where: { uniqueTaskId: taskId },
            });
            this.logger.debug("||| Task deleted");
            return;
        } catch (err) {
            this.logger.warn("||| Task wasn't deleted");
            const task = await this.prismaService.task.findFirst({
                where: { uniqueTaskId: taskId },
            });
            if (!task) {
                this.logger.log("Task doesn't exist");
                throw new BadRequestException(
                    `Task with id "${taskId}" doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }
}
