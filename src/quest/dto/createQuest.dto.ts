import { TaskTypeEnum } from "@prisma/client";
import {
    IsArray,
    IsEnum,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
} from "class-validator";
import CreateTaskDto from "task/dto/createTask.dto";

export class CreateQuestDto {
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    readonly name: string;

    @IsString()
    @MaxLength(200)
    readonly description: string;

    @IsArray()
    @ValidateNested()
    readonly tasks: CreateTaskDto[];
}
