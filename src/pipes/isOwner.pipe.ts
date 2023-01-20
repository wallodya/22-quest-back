import {
    ArgumentMetadata,
    ForbiddenException,
    PipeTransform,
} from "@nestjs/common";
import { RequestContext } from "nestjs-request-context";
import { UserPublic } from "user/types/user";

export class IsOwnerPipe implements PipeTransform<string, Promise<string>> {
    async transform(
        value: string,
        metadata: ArgumentMetadata,
    ): Promise<string> {
        const client: UserPublic = RequestContext.currentContext.req?.user;
        const ownerId = value;
        const isOwner = client.uuid === ownerId;
        if (!isOwner) {
            throw new ForbiddenException(
                "Clients uuid doesn't match query uuid",
            );
        }
        return value;
    }
}
