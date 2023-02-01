import { TaskTypeEnum } from "@prisma/client";

export type CompletedTask = {
    uniqueTaskId: string;
    types: {
        type: {
            name: TaskTypeEnum;
        };
    }[];
    isInQuest: boolean;
    quest: {
        quest_id: number;
    };
    task_id: number;
};
