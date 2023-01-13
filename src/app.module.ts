import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TaskModule } from "./task/task.module";
import { QuestModule } from "./quest/quest.module";
import { TokenModule } from "./token/token.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
    imports: [
        UserModule,
        AuthModule,
        TaskModule,
        QuestModule,
        TokenModule,
        ScheduleModule.forRoot(),
    ],
})
export class AppModule {}
