import { Module } from "@nestjs/common";
import { TokenModule } from "token/token.module";
import { PrismaService } from "../prisma.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    controllers: [UserController],
    providers: [UserService, PrismaService],
    exports: [UserService],
})
export class UserModule {}
