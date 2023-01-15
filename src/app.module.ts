import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TaskModule } from "./task/task.module";
import { QuestModule } from "./quest/quest.module";
import { TokenModule } from "./token/token.module";
import { ScheduleModule } from "@nestjs/schedule";
import { RolesModule } from "./roles/roles.module";
import { APP_GUARD } from "@nestjs/core";
import { LocalAuthGuard } from "auth/strategies/localAuth.strategy";

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
            useClass: LocalAuthGuard,
        },
    ],
})
export class AppModule {}
