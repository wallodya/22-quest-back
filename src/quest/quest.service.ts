import {
    BadRequestException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "prisma.service";
import { TaskService } from "task/task.service";
import { UserPublic } from "user/types/user";
import { UserService } from "user/user.service";
import { CreateQuestDto } from "./dto/createQuest.dto";

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
                include: {
                    tasks: true,
                    author: {
                        select: {
                            uuid: true,
                            login: true,
                        },
                    },
                },
            });
            return allQuests;
        } catch (err) {
            this.logger.warn("||| Couldn't get all Quests");
            this.logger.warn(err);
            throw new ServiceUnavailableException("Couldn't get all quests");
        }
    }

    async get(questId: string) {
        this.logger.debug("Getting quest...");
        try {
            const quest = await this.prismaService.quest.findFirst({
                where: {
                    uniqueQuestId: questId,
                },
                include: {
                    tasks: true,
                },
            });
            return quest;
        } catch (err) {
            this.logger.warn("||| Couldn't get quest");
            this.logger.warn(err);
            throw new ServiceUnavailableException("Couldn't get quest");
        }
    }

    async getAllForUser(userId: string) {
        this.logger.debug("||| Getting quests for user...");
        try {
            const allUserQuests = await this.prismaService.quest.findMany({
                where: {
                    user: {
                        uuid: userId,
                    },
                },
            });
            return allUserQuests;
        } catch (err) {
            this.logger.warn("||| Couldn't get all quests");
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

    async create(dto: CreateQuestDto & { user: UserPublic }) {
        this.logger.debug("||| Creating quest...");
        const tasks = await Promise.all(
            dto.tasks.map((task) =>
                this.taskService.createTask({ ...task, user: dto.user }),
            ),
        );
        try {
            const uniqueQuestId = uuidv4();
            const currentTime = new Date();
            const quest = await this.prismaService.quest.create({
                data: {
                    ...dto,
                    uniqueQuestId,
                    createdAt: currentTime,
                    updatedAt: currentTime,
                    startedAt: currentTime,
                    user: {
                        connect: {
                            uuid: dto.user.uuid,
                        },
                    },
                    author: {
                        connect: {
                            uuid: dto.user.uuid,
                        },
                    },
                    tasks: {
                        connect: {
                            uniqueTaskId: tasks[0].uniqueTaskId,
                        },
                    },
                },
                include: {
                    tasks: true,
                },
            });
            return quest;
        } catch (err) {
            this.logger.warn("||| Couldn't create a quest");
            this.logger.warn(err);
            throw new ServiceUnavailableException("Couldn't create new quest");
        }
    }

    async delete(questId: string) {
        this.logger.debug("||| Deleting quest...");
        const tasksToDelete = await this.prismaService.task.findMany({
            where: {
                isInQuest: true,
                quest: {
                    uniqueQuestId: questId,
                },
            },
            select: {
                uniqueTaskId: true,
            },
        });
        await Promise.all(
            tasksToDelete.map((task) =>
                this.taskService.deleteTask(task.uniqueTaskId),
            ),
        );
        try {
            const deletedQuest = await this.prismaService.quest.delete({
                where: {
                    uniqueQuestId: questId,
                },
            });
            return deletedQuest;
        } catch (err) {
            this.logger.warn("||| Couldn't delete quest");
            const quest = await this.prismaService.quest.findFirst({
                where: {
                    uniqueQuestId: questId,
                },
            });
            if (!quest) {
                throw new BadRequestException(
                    `Quest with id "${questId}" doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async start(questId: string) {
        this.logger.debug("||| Marking quest as started...");
        try {
            const currentTime = new Date();
            const quest = await this.prismaService.quest.update({
                where: {
                    uniqueQuestId: questId,
                },
                data: {
                    isCompleted: false,
                    isStarted: true,
                    startedAt: currentTime,
                },
            });
            this.logger.warn("||| Quest marked as started...");
            return quest;
        } catch (err) {
            this.logger.warn("||| Couldn't mark quest as started...");
            const quest = await this.prismaService.quest.findFirst({
                where: {
                    uniqueQuestId: questId,
                },
            });
            if (!quest) {
                throw new BadRequestException(
                    `Quest with id "${questId}" doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async complete(questId: string) {
        this.logger.debug("||| Marking quest as complete...");
        try {
            const quest = await this.prismaService.quest.update({
                where: {
                    uniqueQuestId: questId,
                },
                data: {
                    isCompleted: true,
                    isStarted: false,
                },
            });
            this.logger.warn("||| Quest marked as complete...");
            return quest;
        } catch (err) {
            this.logger.warn("||| Couldn't mark quest as complete...");
            const quest = await this.prismaService.quest.findFirst({
                where: {
                    uniqueQuestId: questId,
                },
            });
            if (!quest) {
                throw new BadRequestException(
                    `Quest with id "${questId}" doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }
}
