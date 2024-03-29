import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "prisma.service";
import { TaskService } from "task/task.service";
import { UserPublic } from "user/types/user";
import { UserService } from "user/user.service";
import { v4 as uuidv4 } from "uuid";
import { CreateQuestDto } from "./dto/createQuest.dto";

const QUEST_SELECT_FIELDS = {
    quest_id: false,
    uniqueQuestId: true,
    title: true,
    description: true,
    isStarted: true,
    isCompleted: true,
    isFailed: true,
    userId: true,
    authorId: true,
    createdAt: true,
    updatedAt: true,
    startedAt: true,
};

@Injectable()
export class QuestService {
    private readonly logger = new Logger(QuestService.name);
    constructor(
        private prismaService: PrismaService,
        private taskService: TaskService,
        private userService: UserService,
    ) {}

    async getAll(userId: string) {
        this.logger.debug("||| Getting list of all Quests...");
        try {
            const allQuests = await this.prismaService.quest.findMany({
                // orderBy: { quest_id: "asc" },
                select: {
                    ...QUEST_SELECT_FIELDS,
                    // author: {
                    //     select: {
                    //         uuid: true,
                    //     },
                    // },
                    tasks: {
                        include: {
                            types: {
                                select: {
                                    type: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            return allQuests.map((quest) => ({
                ...quest,
                tasks: quest.tasks.map((task) => ({
                    ...task,
                    types: task.types.map((type) => type.type.name),
                })),
            })); // TODO turn into reusable utility function
        } catch (err) {
            this.logger.warn("||| Couldn't get all Quests");
            this.logger.warn(err);
            throw new ServiceUnavailableException("Couldn't get all quests");
        }
    }

    async get(questId: string) {
        this.logger.debug("||| Getting quest...");
        try {
            const quest = await this.prismaService.quest.findFirst({
                where: {
                    uniqueQuestId: questId,
                },
                include: {
                    tasks: {
                        include: {
                            types: {
                                select: {
                                    type: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });
            return {
                ...quest,
                tasks: quest.tasks.map((task) => {
                    return {
                        ...task,
                        types: task.types.map((type) => type.type.name),
                    };
                }),
            };
        } catch (err) {
            this.logger.warn("||| Couldn't get quest");
            this.logger.warn(err);
            throw new ServiceUnavailableException("Couldn't get quest");
        }
    }

    // TODO figure out when to use get, getAll and getAllForUser and which ones are actually necessary
    async getAllForUser(userId: string) {
        this.logger.debug("||| Getting quests for user...");
        try {
            const allUserQuests = await this.prismaService.quest.findMany({
                select: {
                    ...QUEST_SELECT_FIELDS,
                    tasks: {
                        include: {
                            types: {
                                select: {
                                    type: {
                                        select: {
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    user: {
                        select: {
                            uuid: true,
                        },
                    },
                    author: {
                        select: {
                            uuid: true,
                        },
                    },
                },
                where: {
                    user: {
                        uuid: userId,
                    },
                },
            });
            return allUserQuests.map((quest) => ({
                ...quest,
                userId: quest.user.uuid,
                author: quest.author.uuid,
                tasks: quest.tasks.map((task) => ({
                    ...task,
                    types: task.types.map((type) => type.type.name),
                })),
            }));
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
        // const tasks = await Promise.all(
        //     dto.tasks.map((task) =>
        //         this.taskService.createTask({ ...task, user: dto.user }, true),
        //     ),
        // );
        try {
            const uniqueQuestId = uuidv4();
            const currentTime = new Date();
            const quest = await this.prismaService.quest.create({
                data: {
                    ...dto,
                    description: dto.description ?? "",
                    uniqueQuestId,
                    createdAt: currentTime,
                    updatedAt: currentTime,
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
                },
                select: {
                    ...QUEST_SELECT_FIELDS,
                    quest_id: false,
                    user: {
                        select: {
                            uuid: true,
                        },
                    },
                    author: {
                        select: {
                            uuid: true,
                        },
                    },
                },
            });
            return {
                ...quest,
                author: quest.author.uuid,
                userId: quest.user.uuid,
            };
        } catch (err) {
            this.logger.warn("||| Couldn't create a quest");
            const isQuestNameTaken =
                !!(await this.prismaService.quest.findFirst({
                    where: {
                        AND: {
                            user: {
                                uuid: dto.user.uuid,
                            },
                            title: dto.title,
                        },
                    },
                    select: {
                        title: true,
                    },
                }));
            if (isQuestNameTaken) {
                throw new ConflictException(
                    `User already has quest with title "${dto.title}"`,
                );
            }
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
                include: {
                    tasks: true,
                },
            });

            const tasks = await this.prismaService.task.findMany({
                where: {
                    isInQuest: true,
                    quest: {
                        uniqueQuestId: questId,
                    },
                },
                orderBy: {
                    task_id: "asc",
                },
            });

            if (quest.isFailed) {
                const currentTask = tasks.find((task) => task.isCurrentInQuest);
                await this.prismaService.task.update({
                    where: {
                        task_id: currentTask.task_id,
                    },
                    data: {
                        isCurrentInQuest: false,
                    },
                });
                await this.prismaService.quest.update({
                    where: {
                        quest_id: quest.quest_id,
                    },
                    data: {
                        isFailed: false,
                    },
                });
            }

            const firstTask = tasks[0];
            await this.prismaService.task.update({
                where: {
                    task_id: firstTask.task_id,
                },
                data: {
                    isCurrentInQuest: true,
                },
            });

            this.logger.debug("||| Quest marked as started");
            return quest;
        } catch (err) {
            this.logger.warn("||| Couldn't mark quest as started");
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
