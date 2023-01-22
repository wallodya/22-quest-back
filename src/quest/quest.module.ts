import { Module } from "@nestjs/common";
import { PrismaService } from "prisma.service";
import { TaskModule } from "task/task.module";
import { UserModule } from "user/user.module";
import { QuestController } from "./quest.controller";
import { QuestService } from "./quest.service";

@Module({
    controllers: [QuestController],
    providers: [QuestService, PrismaService],
    imports: [TaskModule, UserModule],
})
export class QuestModule {}
