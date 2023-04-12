/* eslint-disable @typescript-eslint/ban-types */
import {
    ArgumentMetadata,
    BadRequestException,
    Logger,
    PipeTransform,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export class ValidationPipe implements PipeTransform<any> {
    private readonly logger = new Logger(ValidationPipe.name);
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToInstance(metatype, value);
        this.logger.log("Validating object: ");
        console.dir(object);
        const errors = await validate(object);
        this.logger.log("Validation errors: ");
        this.logger.log(errors);
        if (errors.length > 0) {
            const errMessages = Object.fromEntries(
                errors.map((err) => [err.property, err.constraints]),
            );
            throw new BadRequestException({
                error: "Bad Request",
                status: 400,
                errors: errMessages,
            });
        }
        return value;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}
