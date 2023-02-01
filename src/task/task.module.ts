import { forwardRef, Module } from "@nestjs/common";
import { PrismaService } from "prisma.service";
import { QuestModule } from "quest/quest.module";
import { UserModule } from "user/user.module";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";

@Module({
    controllers: [TaskController],
    providers: [TaskService, PrismaService],
    imports: [UserModule],
    exports: [TaskService],
})
export class TaskModule {}
