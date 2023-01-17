import { TaskTypeEnum } from "@prisma/client";
import { IsEnum, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTaskTypeDto {
    @IsEnum(TaskTypeEnum)
    readonly name: TaskTypeEnum;

    @IsString()
    @MinLength(4)
    @MaxLength(200)
    readonly description: string;
}
