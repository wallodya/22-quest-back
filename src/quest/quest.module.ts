import { Module } from "@nestjs/common";
import { PrismaService } from "prisma.service";
import { TaskModule } from "task/task.module";
import { QuestController } from "./quest.controller";
import { QuestService } from "./quest.service";

@Module({
    controllers: [QuestController],
    providers: [QuestService, PrismaService],
    imports: [TaskModule],
})
export class QuestModule {}
