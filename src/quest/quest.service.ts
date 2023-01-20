import {
    BadRequestException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "prisma.service";
import { TaskService } from "task/task.service";
import { UserService } from "user/user.service";

@Injectable()
export class QuestService {
    private readonly logger = new Logger(QuestService.name);
    constructor(
        private prismaService: PrismaService,
        private taskService: TaskService,
        private userService: UserService,
    ) {}

    async getAll() {
        this.logger.debug("Getting list of all Quests...");
        try {
            const allQuests = await this.prismaService.quest.findMany({
                orderBy: { quest_id: "asc" },
            });
            return allQuests;
        } catch (err) {
            this.logger.warn("||| Couldn't get all Quests");
            this.logger.warn(err);
            throw new ServiceUnavailableException("Couldn't get all quests");
        }
    }

    async getForUser(userId: string) {
        try {
            const allUserTasks = await this.prismaService.quest.findMany({
                where: {
                    user: {
                        uuid: userId,
                    },
                },
            });
            return allUserTasks;
        } catch (err) {
            this.logger.warn("||| Couldn't get all tasks");
            const doesUserExist = await this.userService.getUserByUUID(userId);
            if (!doesUserExist) {
                throw new BadRequestException(
                    `User with id ${userId} doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async create(questId: string) {
        return;
    }

    async delete(questId: string) {
        return;
    }

    async restart(questId: string) {
        return;
    }
}
