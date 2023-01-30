import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Query,
} from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { ValidationPipe } from "pipes/validation.pipe";
import { Roles } from "roles/decorators/roles.decorator";
import { CreateQuestDto } from "./dto/createQuest.dto";
import { QuestService } from "./quest.service";

@Controller("quest")
export class QuestController {
    constructor(private questService: QuestService) {}

    @Roles(RoleEnum.ADMIN, RoleEnum.DEV)
    @Get("all")
    getAll() {
        return this.questService.getAll();
    }

    @Get("u")
    getAllForUser(@Query("uuid") uuid: string) {
        return this.questService.getAllForUser(uuid);
    }

    @Get()
    getOne(@Query("id") questId: string) {
        return this.questService.get(questId);
    }

    @Patch()
    complete(@Query("id") questId: string) {
        return this.questService.complete(questId);
    }

    @Patch()
    start(@Query("id") questId: string) {
        return this.questService.start(questId);
    }

    @Post()
    create(@Body(new ValidationPipe()) dto: CreateQuestDto) {
        return this.questService.create(dto);
    }

    @Delete()
    delete(@Query("id") quetsId: string) {
        return this.questService.delete(quetsId);
    }
}
