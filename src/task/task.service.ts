import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    MethodNotAllowedException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { Prisma, Task, TaskTypeEnum } from "@prisma/client";
import { PrismaService } from "prisma.service";
import { UserPublic } from "user/types/user";
import { UserService } from "user/user.service";
import { v4 as uuidv4 } from "uuid";
import CreateTaskDto from "./dto/createTask.dto";
import { CreateTaskTypeDto } from "./dto/createTaskType.dto";
import { CompletedTask } from "./types/task.types";
import { getTaskFailTimoutName } from "./utils/task.utils";
import { QuestService } from "quest/quest.service";

@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    readonly TASK_SELECT_FIELDS = {
        userId: true,
        uniqueTaskId: true,
        isCompleted: true,
        isFailed: true,
        title: true,
        text: true,
        types: {
            select: {
                type: {
                    select: {
                        name: true,
                    },
                },
            },
        },
        startTime: true,
        endTime: true,
        duration: true,
        repeatTimes: true, // TODO rename to repeatCount
        priority: true,
        isInQuest: true,
        questId: false,
        quest: {
            select: {
                uniqueQuestId: true,
            },
        },
        isCurrentInQuest: true,
        createdAt: true,
        updatedAt: true,
    };

    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
        private schedulerRegistry: SchedulerRegistry,
    ) {}

    async getAll() {
        this.logger.debug("Getting list of all tasks...");
        try {
            const allTasks = await this.prismaService.task.findMany({
                orderBy: { task_id: "asc" },
            });
            return allTasks;
        } catch (err) {
            this.logger.warn("||| Couldn't get all tasks");
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async getAllForUser(userid: string) {
        try {
            const allUserTasks = await this.prismaService.task.findMany({
                where: {
                    user: {
                        uuid: userid,
                    },
                    isInQuest: false,
                },
                select: this.TASK_SELECT_FIELDS,
            });
            return allUserTasks.map((task) => {
                const { userId, ...taskRes } = task;
                return {
                    ...taskRes,
                    uniqueQuestId: taskRes.quest?.uniqueQuestId ?? null,
                    types: taskRes.types.map((type) => type.type.name),
                    repeatCount: taskRes.repeatTimes,
                };
            });
        } catch (err) {
            this.logger.warn("||| Couldn't get all tasks for user");
            const doesUserExist = await this.userService.getUserByUUID(userid);
            if (!doesUserExist) {
                throw new BadRequestException(
                    `User with id ${userid} doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException(
                "Couldn't get all tasks for user",
            );
        }
    }

    async getAllForQuest(questId: string) {
        this.logger.debug("||| Getting tasks for quest: ", questId);
        try {
            const tasks = await this.prismaService.task.findMany({
                where: {
                    isInQuest: true,
                    quest: {
                        uniqueQuestId: questId,
                    },
                },
                select: this.TASK_SELECT_FIELDS,
            });
            return tasks.map((task) => {
                const { repeatTimes, userId, ...taskRes } = task;
                return {
                    ...taskRes,
                    uniqueQuestId: taskRes.quest.uniqueQuestId,
                    types: taskRes.types.map((type) => type.type.name),
                    repeatCount: task.repeatTimes,
                };
            });
        } catch (err) {
            this.logger.warn("||| couldn't get tasks for quest");
            const doesQuestExist = !!(await this.prismaService.quest.findFirst({
                where: {
                    uniqueQuestId: questId,
                },
            }));
            if (!doesQuestExist) {
                throw new BadRequestException(
                    `Quest with id ${questId} doesn't exist`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException(
                "Couldn't get all tasks for quest",
            );
        }
    }

    async createTask(
        dto: CreateTaskDto & { user: UserPublic },
        isInQuest = false,
        questId?: string,
    ) {
        this.logger.debug("||| Creating a task...");
        this.validateDto(dto);
        try {
            const currentTime = new Date();
            const taskId = uuidv4();
            const userId = dto.user.uuid;
            const newTaskWOTypes = isInQuest
                ? await this.prismaService.task.create({
                      data: {
                          ...dto,
                          uniqueTaskId: taskId,
                          createdAt: currentTime,
                          updatedAt: currentTime,
                          types: {},
                          isInQuest: isInQuest,
                          user: {
                              connect: {
                                  uuid: userId,
                              },
                          },
                          quest: {
                              connect: {
                                  uniqueQuestId: questId,
                              },
                          },
                      },
                  })
                : await this.prismaService.task.create({
                      data: {
                          ...dto,
                          uniqueTaskId: taskId,
                          createdAt: currentTime,
                          updatedAt: currentTime,
                          types: {},
                          isInQuest: isInQuest,
                          user: {
                              connect: {
                                  uuid: userId,
                              },
                          },
                      },
                  });

            const newTask = await this.attachTypes(newTaskWOTypes, dto.types);
            const isPeriodic = dto.types.includes(TaskTypeEnum.PERIODIC);
            if (isPeriodic) {
                const failsIn =
                    newTaskWOTypes.endTime.getTime() - currentTime.getTime();
                this.setFailTaskTimeout(taskId, failsIn);
            }
            this.logger.debug("||| Task created");
            return newTask;
        } catch (err) {
            this.logger.warn("||| Couldn't create a task");
            this.logger.warn(err);
            const userTasks = await this.prismaService.task.findMany({
                where: {
                    user: {
                        uuid: dto.user.uuid,
                    },
                },
                select: {
                    title: true,
                },
            });
            const isTaskTitleTaken = userTasks.some(
                (task) => task.title === dto.title,
            );
            if (isTaskTitleTaken) {
                throw new ConflictException(
                    `User already has task with title "${dto.title}"`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async failTask(taskId: string) {
        this.logger.debug("Marking task as failed...");
        this.validateTimePeriod(taskId, this.failTask.name);
        try {
            const currentTime = new Date(Date.now());
            const failedTask = await this.prismaService.task.update({
                where: {
                    uniqueTaskId: taskId,
                },
                data: {
                    isFailed: true,
                    updatedAt: currentTime,
                },
                // select: {
                //     uniqueTaskId: true,
                //     types: {
                //         select: {
                //             type: {
                //                 select: {
                //                     name: true,
                //                 },
                //             },
                //         },
                //     },
                //     priority: true,
                //     isInQuest: true,
                //     quest: true,
                // },
                select: { ...this.TASK_SELECT_FIELDS, quest: true },
            });

            const isPeriodic = failedTask.types.some(
                (type) => type.type.name === TaskTypeEnum.PERIODIC,
            );
            if (isPeriodic) {
                this.removeFailTaskTimeOut(failedTask.uniqueTaskId);
            }

            const isImoprtant =
                failedTask.priority === "MEDIUM" ||
                failedTask.priority === "URGENT";
            const { isInQuest } = failedTask;
            if (isImoprtant && isInQuest) {
                const failedQuest = await this.prismaService.quest.update({
                    where: {
                        quest_id: failedTask.quest.quest_id,
                    },
                    data: {
                        isFailed: true,
                    },
                });
                return failedQuest;
            }

            this.logger.debug("||| Task was marked failed");
            return failedTask;
        } catch (err) {
            this.logger.warn("||| Couldn't fail the task");
            await this.checkIfExists(taskId);
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async checkTask(taskId: string) {
        this.logger.debug("||| Checking the task");
        this.validateTimePeriod(taskId, this.checkTask.name);
        try {
            const currentTime = new Date(Date.now());
            const checkedTask = await this.prismaService.task.update({
                where: {
                    uniqueTaskId: taskId,
                },
                data: {
                    repeatTimes: {
                        decrement: 1,
                    },
                    updatedAt: currentTime,
                },
                select: this.TASK_SELECT_FIELDS,
            });
            if (checkedTask.repeatTimes === 0) {
                return this.completeTask(taskId);
            }
            this.logger.debug("||| Task was checked");
            return checkedTask;
        } catch (err) {
            this.logger.warn("||| Task wasn't checked");
            await this.checkIfExists(taskId);
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async completeTask(taskId: string) {
        this.logger.debug("||| Marking task as completed...");
        this.validateTimePeriod(taskId, this.completeTask.name);
        try {
            const currentTime = new Date(Date.now());
            const completedTask = await this.prismaService.task.update({
                where: { uniqueTaskId: taskId },
                data: {
                    isCurrentInQuest: false,
                    isCompleted: true,
                    updatedAt: currentTime,
                },
                // select: {
                //     task_id: true,
                //     isInQuest: true,
                //     quest: {
                //         select: {
                //             quest_id: true,
                //         },
                //     },
                //     uniqueTaskId: true,
                //     types: {
                //         select: {
                //             type: {
                //                 select: {
                //                     name: true,
                //                 },
                //             },
                //         },
                //     },
                // },
                select: {
                    ...this.TASK_SELECT_FIELDS,
                    quest: true,
                    task_id: true,
                },
            });

            const isPeriodic = completedTask.types.some(
                (type) => type.type.name === TaskTypeEnum.PERIODIC,
            );

            if (isPeriodic) {
                this.removeFailTaskTimeOut(completedTask.uniqueTaskId);
            }

            if (completedTask.isInQuest) {
                this.logger.log("Task is in quest");
                return this.switchCurrentTask(completedTask);
            }

            this.logger.log("Task isn't in quest");
            this.logger.debug("||| Task marked as completed");
            const { task_id, quest, ...completedTaskRes } = completedTask;
            return completedTaskRes;
        } catch (err) {
            this.logger.warn("||| Task wasn't marked as completed");
            await this.checkIfExists(taskId);
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async switchCurrentTask(completedTask: CompletedTask) {
        this.logger.debug("||| switching current task in quest...");
        const nextTask = await this.prismaService.task.findFirst({
            where: {
                AND: {
                    task_id: {
                        gt: completedTask.task_id,
                    },
                    isInQuest: true,
                    questId: completedTask.quest.quest_id,
                },
            },
            select: {
                task_id: true,
            },
        });

        if (nextTask) {
            const currentTask = await this.prismaService.task.update({
                where: {
                    task_id: nextTask.task_id,
                },
                data: {
                    isCurrentInQuest: true,
                },
            });
            this.logger.debug("||| Current task switched...");
            return currentTask;
        }

        const completedQuest = await this.prismaService.quest.update({
            where: {
                quest_id: completedTask.quest.quest_id,
            },
            data: {
                isCompleted: true,
            },
        });

        this.logger.debug("||| No next task: quest completed...");
        return completedQuest;
    }

    async deleteTask(taskId: string) {
        this.logger.debug("||| Deleting task...");
        try {
            const taskToDelete = await this.prismaService.task.findUnique({
                where: {
                    uniqueTaskId: taskId,
                },
                select: {
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
            });
            const isPeriodic = taskToDelete.types.some(
                (type) => type.type.name === TaskTypeEnum.PERIODIC,
            );
            const deletedTask = await this.prismaService.task.delete({
                where: { uniqueTaskId: taskId },
            });
            if (isPeriodic) {
                this.removeFailTaskTimeOut(deletedTask.uniqueTaskId);
            }
            this.logger.debug("||| Task deleted");
            return deletedTask;
        } catch (err) {
            this.logger.warn("||| Task wasn't deleted");
            await this.checkIfExists(taskId);
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async getAllTaskTypes() {
        this.logger.debug("Getting list of all tasks types...");
        try {
            const allTaskTypes = await this.prismaService.taskType.findMany({
                orderBy: { taskType_id: "asc" },
            });
            return allTaskTypes;
        } catch (err) {
            this.logger.warn("||| Couldn't get all tasks types");
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async getTaskType(typeName: TaskTypeEnum) {
        this.logger.debug(`Getting task type: ${typeName}...`);
        try {
            const taskType = await this.prismaService.taskType.findMany({
                where: {
                    name: typeName,
                },
            });
            return taskType;
        } catch (err) {
            this.logger.warn("||| Couldn't get all tasks types");
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async createTaskType(dto: CreateTaskTypeDto) {
        this.logger.debug(`||| Creating task type: ${dto.name}...`);
        try {
            const currentTime = new Date(Date.now());
            const type = await this.prismaService.taskType.create({
                data: {
                    ...dto,
                    createdat: currentTime,
                    updatedAt: currentTime,
                },
            });
            this.logger.debug(`||| Task type ${dto.name} created`);
            return type;
        } catch (err) {
            this.logger.warn("||| Couldn't create task type");
            const type = await this.prismaService.taskType.findFirst({
                where: {
                    name: dto.name,
                },
            });
            if (type) {
                throw new BadRequestException(
                    `Task with name "${dto.name}" already exists`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async updateTaskType(dto: CreateTaskTypeDto) {
        this.logger.debug(`||| Updating task type: ${dto.name}...`);
        try {
            const currentTime = new Date(Date.now());
            const type = await this.prismaService.taskType.update({
                where: {
                    name: dto.name,
                },
                data: {
                    ...dto,
                    updatedAt: currentTime,
                },
            });
            this.logger.debug(`||| Task type ${dto.name} updated`);
            return type;
        } catch (err) {
            this.logger.warn("||| Couldn't create task type");
            const type = await this.prismaService.taskType.findFirst({
                where: {
                    name: dto.name,
                },
            });
            if (!type) {
                throw new BadRequestException(
                    `Task with name "${dto.name}" doesn't exists`,
                );
            }
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    async addTaskToQuest(taskId: string, questId: string) {
        this.logger.debug("||| Adding task to a quest...");
        try {
            const addedTask = await this.prismaService.task.update({
                where: {
                    uniqueTaskId: taskId,
                },
                data: {
                    isInQuest: true,
                    quest: {
                        connect: {
                            uniqueQuestId: questId,
                        },
                    },
                },
            });
            this.logger.debug("||| Task was added to quest");
            return addedTask;
        } catch (err) {
            this.logger.warn("||| Couldn't add task to quest");
            await this.checkIfExists(taskId);
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
        return;
    }

    private async attachTypes(task: Task, types: TaskTypeEnum[]) {
        this.logger.debug("||| Attaching types to the task...");
        try {
            const typesFromDto = await this.prismaService.taskType.findMany({
                where: {
                    name: {
                        in: types,
                    },
                },
            });
            const typesOnTaskdData: Prisma.Enumerable<Prisma.TaskTypeOnTaskCreateManyInput> =
                typesFromDto.map((type) => {
                    return {
                        taskId: task.task_id,
                        taskTypeId: type.taskType_id,
                    };
                });

            await this.prismaService.taskTypeOnTask.createMany({
                data: typesOnTaskdData,
            });

            const newTaskTypes =
                await this.prismaService.taskTypeOnTask.findMany({
                    where: {
                        taskId: task.task_id,
                    },
                    select: {
                        type: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            this.logger.warn("||| Types attached to a task");
            const { task_id, difficulty, ...newTask } = task;
            return {
                ...newTask,
                types: newTaskTypes.map((type) => type.type.name),
            };
        } catch (err) {
            this.logger.warn("||| Couldn't attach types to a task");
            this.logger.warn(err);
            throw new ServiceUnavailableException();
        }
    }

    private async validateTimePeriod(taskId: string, funcName?: string) {
        const { startTime, endTime, types } =
            await this.prismaService.task.findFirst({
                where: {
                    uniqueTaskId: taskId,
                },
                select: {
                    startTime: true,
                    endTime: true,
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
            });
        const isPeriodic = !types?.some(
            (type) => type.type.name === TaskTypeEnum.PERIODIC,
        );
        if (isPeriodic) {
            return;
        }
        this.logger.verbose("Validating current time period...");
        const currentTime = new Date(Date.now());
        const hasStarted = currentTime >= startTime;
        const hasEnded = currentTime >= endTime;
        const isFailTaskFunc = funcName === "failTask";
        if (!hasStarted || (hasEnded && !isFailTaskFunc)) {
            throw new MethodNotAllowedException(
                funcName
                    ? `Failed to execute${funcName}. It is not possible at this time (${currentTime})`
                    : "It is not possible to do this action right now",
            );
        }
        this.logger.verbose("Time period validated");
        return;
    }

    private validateDto(dto: CreateTaskDto) {
        this.logger.verbose("Validaing CreateTaskDto...");
        this.logger.verbose("DTO:");
        console.dir(dto);
        const isBasic = dto.types.includes(TaskTypeEnum.BASIC);
        const hasMultipleTypes = dto.types.length > 1;
        if (isBasic && hasMultipleTypes) {
            throw new BadRequestException(
                `${TaskTypeEnum.BASIC} type cannot be combined with other task types`,
            );
        }

        const isPeriodic = dto.types.includes(TaskTypeEnum.PERIODIC);
        if (isPeriodic) {
            const hasTimeFileds = dto.startTime && dto.endTime;
            if (!hasTimeFileds) {
                throw new BadRequestException(
                    `${TaskTypeEnum.PERIODIC} task types must have "startTime" and "endTime" properties`,
                );
            }
            const currentTime = new Date();
            const isTimePeriodsValid =
                dto.endTime > currentTime && dto.endTime > dto.startTime;
            if (isTimePeriodsValid) {
                throw new BadRequestException("Invalid time period");
            }
        }

        const isRepeat = dto.types.includes(TaskTypeEnum.REPEAT);
        const hasRepeatTimesField = dto.repeatTimes;
        if (isRepeat && !hasRepeatTimesField) {
            throw new BadRequestException(
                `${TaskTypeEnum.REPEAT} must have "repeatTimes" property`,
            );
        }

        const isTimer = dto.types.includes(TaskTypeEnum.TIMER);
        const hasDurationFiled = dto.duration;
        if (isTimer && !hasDurationFiled) {
            throw new BadRequestException(
                `${TaskTypeEnum.TIMER} must have "duration" property`,
            );
        }
        this.logger.verbose("CreateTaskDto validated");
    }

    private async checkIfExists(taskId: string) {
        const task = await this.prismaService.task.findFirst({
            where: { uniqueTaskId: taskId },
        });
        if (!task) {
            this.logger.log("Task doesn't exist");
            throw new BadRequestException(
                `Task with id "${taskId}" doesn't exist`,
            );
        }
        return task;
    }

    private setFailTaskTimeout(taskId: string, failsIn: number) {
        this.logger.verbose("Setting timeout for automatic task fail...");
        const failTaskCallback = async (taskId) => await this.failTask(taskId);
        const timeout = setTimeout(() => failTaskCallback(taskId), failsIn);
        const timeoutName = getTaskFailTimoutName(taskId);
        this.schedulerRegistry.addTimeout(timeoutName, timeout);
        this.logger.verbose("Timer for auto task fail set");
        return;
    }

    private removeFailTaskTimeOut(taskId: string) {
        this.logger.verbose("Removing automatic task fail timout...");
        this.schedulerRegistry.deleteTimeout(getTaskFailTimoutName(taskId));
        this.logger.verbose("Timer for auto task fail removed");
    }
}
