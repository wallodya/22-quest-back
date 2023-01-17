import {
    Prisma,
    TaskDifficultyEnum,
    TaskPriorityEnum,
    TaskTypeEnum,
} from "@prisma/client";
import {
    IsArray,
    IsDate,
    IsEnum,
    IsIn,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    MinLength,
} from "class-validator";

class CreateTaskDto {
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    readonly title: string;

    @IsString()
    @MaxLength(140)
    readonly text?: string;

    @IsString()
    @IsEnum(TaskDifficultyEnum)
    readonly difficulty: TaskDifficultyEnum;

    @IsString()
    @IsEnum(TaskPriorityEnum)
    readonly priority: TaskPriorityEnum;

    @IsArray()
    @IsIn(Object.values(TaskTypeEnum), { each: true })
    readonly types: TaskTypeEnum[];

    // @IsDate()
    @IsOptional()
    readonly startTime?: Date;

    // @IsDate()
    @IsOptional()
    readonly endTime?: Date;

    @IsNumber()
    @IsOptional()
    readonly duration?: number;

    @IsNumber()
    @IsOptional()
    readonly repeatTimes?: number;
}

export default CreateTaskDto;
