import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Query,
    Req,
} from "@nestjs/common";
import { Request } from "express";
import { RoleEnum } from "@prisma/client";
import { ValidationPipe } from "pipes/validation.pipe";
import { Roles } from "roles/decorators/roles.decorator";
import { CreateQuestDto } from "./dto/createQuest.dto";
import { QuestService } from "./quest.service";
import { UserPublic } from "user/types/user";

@Controller("quest")
export class QuestController {
    constructor(private questService: QuestService) {}

    @Roles(RoleEnum.ADMIN, RoleEnum.DEV)
    @Get("all")
    getAll(@Req() req: Request) {
        return this.questService.getAll((req.user as UserPublic).uuid);
    }

    @Get()
    getAllForUser(@Req() req: Request) {
        return this.questService.getAllForUser((req.user as UserPublic).uuid);
    }

    @Get("q")
    getOne(@Query("id") questId: string) {
        return this.questService.get(questId);
    }

    @Patch("complete")
    complete(@Query("id") questId: string) {
        return this.questService.complete(questId);
    }

    @Patch("start")
    start(@Query("id") questId: string) {
        return this.questService.start(questId);
    }

    @Post()
    create(
        @Body(new ValidationPipe()) dto: CreateQuestDto,
        @Req() req: Request,
    ) {
        return this.questService.create({
            ...dto,
            user: req.user as UserPublic,
        });
    }

    @Delete()
    delete(@Query("id") quetsId: string) {
        return this.questService.delete(quetsId);
    }
}
