import { Module } from "@nestjs/common";
import { AuthModule } from "auth/auth.module";
import { PrismaService } from "prisma.service";
import { TokenModule } from "token/token.module";
import { UserModule } from "user/user.module";
import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

@Module({
    controllers: [RolesController],
    providers: [RolesService, PrismaService],
    imports: [AuthModule, TokenModule, UserModule],
})
export class RolesModule {}
