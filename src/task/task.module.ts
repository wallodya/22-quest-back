import { Module } from "@nestjs/common";
import { PrismaService } from "prisma.service";
import { UserModule } from "user/user.module";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";

@Module({
    controllers: [TaskController],
    providers: [TaskService, PrismaService],
    imports: [UserModule],
})
export class TaskModule {}
