import { TaskTypeEnum } from "@prisma/client";
import {
    IsDate,
    IsEnum,
    IsNumber,
    IsString,
    Max,
    MaxLength,
    MinLength,
} from "class-validator";

class CreateTaskDto {
    @IsString()
    @MinLength(4)
    @MaxLength(20)
    private readonly title: string;

    @IsString()
    @MaxLength(140)
    private readonly text?: string;

    @IsString()
    private readonly difficulty: string;

    @IsString()
    private readonly priority: string;

    @IsString()
    @IsEnum(TaskTypeEnum)
    private readonly type: TaskTypeEnum;

    @IsDate()
    private readonly startTime?: Date;

    @IsDate()
    private readonly endTime?: Date;

    @IsNumber()
    private readonly duration?: number;

    @IsNumber()
    private readonly repeatTimes?: number;
}

export default CreateTaskDto;
