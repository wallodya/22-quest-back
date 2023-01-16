import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TaskModule } from "./task/task.module";
import { QuestModule } from "./quest/quest.module";
import { TokenModule } from "./token/token.module";
import { ScheduleModule } from "@nestjs/schedule";
import { RolesModule } from "./roles/roles.module";
import { JwtAuthGuard } from "auth/guards/jwt.guard";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "roles/guards/roles.guard";

@Module({
    imports: [
        UserModule,
        AuthModule,
        TaskModule,
        QuestModule,
        TokenModule,
        ScheduleModule.forRoot(),
        RolesModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}
