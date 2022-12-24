import { Controller, Delete, Get, Post } from "@nestjs/common";

@Controller("quest")
export class QuestController {
    @Get()
    getQuest() {
        return;
    }
    @Post()
    createQuest() {
        return;
    }
    @Post("start")
    startQuest() {
        return;
    }
    @Post("complete")
    completeQuest() {
        return;
    }
    @Delete()
    deleteQuest() {
        return;
    }
}
