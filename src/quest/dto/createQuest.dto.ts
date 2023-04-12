import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateQuestDto {
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    readonly title: string;

    @IsString()
    @MaxLength(200)
    readonly description?: string;

    // @IsArray()
    // @ValidateNested()
    // readonly tasks: CreateTaskDto[];
}
