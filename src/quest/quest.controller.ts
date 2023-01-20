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
        return;
    }

    @Get()
    getQuest(@Query("id") questId: string) {
        return;
    }

    @Post()
    createQuest() {
        return;
    }

    @Delete()
    deleteQuest() {
        return;
    }
}
