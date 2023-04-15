import {
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
    MaxLength,
    MinLength,
} from "class-validator";

class CreateTaskDto {
    @IsString()
    @MinLength(1)
    @MaxLength(20)
    readonly title: string;

    @IsOptional()
    @IsString()
    @MaxLength(140)
    readonly text?: string;

    @IsString()
    @IsEnum(TaskPriorityEnum)
    readonly priority: TaskPriorityEnum;

    @IsArray()
    @IsIn(Object.values(TaskTypeEnum), { each: true })
    readonly types: TaskTypeEnum[];

    @IsString({ message: "startTime must be a string" })
    @IsOptional()
    readonly startTime?: Date;

    @IsString({ message: "endTime must be a string" })
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
