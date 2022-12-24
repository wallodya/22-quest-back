import { Module } from "@nestjs/common";
import { QuestController } from "./quest.controller";

@Module({
    controllers: [QuestController],
})
export class QuestModule {}
